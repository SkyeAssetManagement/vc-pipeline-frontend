import {
  QueryEnhancement,
  DocumentReranking,
  AnswerGeneration,
  QueryIntentClassification
} from './signatures';
import { ChainOfThought, Predict } from './prompt-compiler';
import { WeaviateService } from '../weaviate';
import { ClaudeService } from '../claude';

export class OptimizedRAGPipeline {
  private queryEnhancer: ChainOfThought<QueryEnhancement>;
  private documentReranker: ChainOfThought<DocumentReranking>;
  private answerGenerator: ChainOfThought<AnswerGeneration>;
  private intentClassifier: Predict<QueryIntentClassification>;
  private weaviateService: typeof WeaviateService;
  private trainingExamples: Map<string, Array<{ input: any; output: any; score: number }>>;

  constructor() {
    this.queryEnhancer = new ChainOfThought<QueryEnhancement>('query-enhancement');
    this.documentReranker = new ChainOfThought<DocumentReranking>('document-reranking');
    this.answerGenerator = new ChainOfThought<AnswerGeneration>('answer-generation');
    this.intentClassifier = new Predict<QueryIntentClassification>('intent-classification');
    this.weaviateService = WeaviateService;
    this.trainingExamples = new Map();
  }

  async forward(query: string, filters?: any) {
    // Step 1: Classify query intent
    const intentPrompt = `Classify this venture capital query:
Query: "${query}"

Respond with JSON:
{
  "intentType": "factual|analytical|comparison|exploratory",
  "documentTypes": ["term_sheet", "investment_memo", etc.],
  "entities": ["company names", "investor names", etc.]
}`;

    const intentResponse = await ClaudeService.generateAnswer(intentPrompt, [], []);
    let intent: QueryIntentClassification;

    try {
      intent = JSON.parse(intentResponse.answer);
    } catch {
      intent = {
        query,
        intentType: 'factual',
        documentTypes: [],
        entities: []
      };
    }

    // Step 2: Enhance query - but keep it simple
    // For now, just use the original query to avoid losing important terms
    const enhancedQuery = query;
    console.log('DSPy: Using original query to preserve accuracy:', query);

    // Step 3: Retrieve documents from Weaviate
    const searchResults = await this.weaviateService.hybridSearch(
      enhancedQuery,
      filters?.limit || 30
    );

    // Step 4: Rerank documents - use more content for better ranking
    const rerankPrompt = `Rerank these documents by relevance to the query.
Query: "${query}"

Documents:
${searchResults.slice(0, 20).map((doc: any, i: number) =>
  `${i + 1}. ${doc.company_name} - ${doc.document_type}: ${doc.content?.substring(0, 500)}...`
).join('\n')}

Return the indices of the top 15 most relevant documents as a JSON array (0-indexed):`;

    const rerankResponse = await ClaudeService.generateAnswer(rerankPrompt, [], []);
    let topIndices: number[];

    try {
      topIndices = JSON.parse(rerankResponse.answer);
    } catch {
      // If parsing fails, just use the first 15 documents
      topIndices = Array.from({length: Math.min(15, searchResults.length)}, (_, i) => i);
    }

    const topDocuments = topIndices
      .filter(i => i >= 0 && i < searchResults.length)
      .map(i => searchResults[i]);

    // Step 5: Generate answer
    const answerResponse = await ClaudeService.generateAnswer(
      query,
      topDocuments,
      [] // company groups will be calculated if needed
    );

    return {
      query,
      enhancedQuery,
      intent: intent.intentType,
      entities: intent.entities,
      documents: topDocuments,
      answer: answerResponse.answer,
      sources: answerResponse.sources,
      confidence: answerResponse.confidence
    };
  }

  async addTrainingExample(task: string, input: any, output: any, score: number) {
    if (!this.trainingExamples.has(task)) {
      this.trainingExamples.set(task, []);
    }

    const examples = this.trainingExamples.get(task)!;
    examples.push({ input, output, score });

    // Keep only the best 100 examples
    if (examples.length > 100) {
      examples.sort((a, b) => b.score - a.score);
      examples.splice(100);
    }
  }

  getTrainingExamples(task: string): Array<{ input: any; output: any; score: number }> {
    return this.trainingExamples.get(task) || [];
  }
}

export class AdaptiveQueryOptimizer {
  private performanceMetrics: Map<string, number>;
  private strategies: Map<string, (query: string) => Promise<string>>;

  constructor() {
    this.performanceMetrics = new Map();
    this.strategies = new Map();
    this.initializeStrategies();
  }

  private initializeStrategies() {
    // Basic enhancement
    this.strategies.set('basic', async (query: string) => {
      return query;
    });

    // Synonym expansion
    this.strategies.set('synonym', async (query: string) => {
      const synonymMap: Record<string, string[]> = {
        'investment': ['funding', 'capital', 'financing'],
        'company': ['startup', 'portfolio company', 'venture'],
        'valuation': ['worth', 'value', 'pricing'],
      };

      let enhanced = query;
      for (const [word, synonyms] of Object.entries(synonymMap)) {
        if (query.toLowerCase().includes(word)) {
          enhanced += ` OR (${synonyms.join(' OR ')})`;
        }
      }
      return enhanced;
    });

    // Entity extraction
    this.strategies.set('entity', async (query: string) => {
      // Extract company names and add them explicitly
      const companies = ['Advanced Navigation', 'Baraja', 'Gilmour Space'];
      const mentioned = companies.filter(c =>
        query.toLowerCase().includes(c.toLowerCase())
      );

      if (mentioned.length > 0) {
        return `${query} company:(${mentioned.join(' OR ')})`;
      }
      return query;
    });
  }

  async selectOptimalStrategy(query: string): Promise<string> {
    // Select strategy based on performance history
    const bestStrategy = this.getBestPerformingStrategy();
    const enhancer = this.strategies.get(bestStrategy) || this.strategies.get('basic')!;
    return enhancer(query);
  }

  private getBestPerformingStrategy(): string {
    if (this.performanceMetrics.size === 0) {
      return 'synonym'; // Default strategy
    }

    let bestStrategy = 'basic';
    let bestScore = 0;

    Array.from(this.performanceMetrics.entries()).forEach(([strategy, score]) => {
      if (score > bestScore) {
        bestScore = score;
        bestStrategy = strategy;
      }
    });

    return bestStrategy;
  }

  async updatePerformance(strategy: string, score: number) {
    const currentScore = this.performanceMetrics.get(strategy) || 0;
    // Exponential moving average
    const updatedScore = 0.7 * currentScore + 0.3 * score;
    this.performanceMetrics.set(strategy, updatedScore);
  }
}