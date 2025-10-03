import { OptimizedRAGPipeline } from './modules-native';
import { DSPY_CONFIG, EVALUATION_METRICS } from './config';

export interface TrainingExample {
  query: string;
  expectedAnswer?: string;
  relevantDocs?: string[];
  confidence?: 'high' | 'medium' | 'low';
  score?: number;
}

export interface EvaluationMetrics {
  relevance: number;
  completeness: number;
  accuracy: number;
  sourceQuality: number;
  overall: number;
}

export class DSPyOptimizer {
  private pipeline: OptimizedRAGPipeline;
  private trainingExamples: TrainingExample[];
  private validationExamples: TrainingExample[];
  private compiledPipeline: OptimizedRAGPipeline | null = null;
  private optimizationHistory: Array<{
    timestamp: Date;
    metrics: EvaluationMetrics;
    exampleCount: number;
  }> = [];

  constructor() {
    this.pipeline = new OptimizedRAGPipeline();
    this.trainingExamples = [];
    this.validationExamples = [];
  }

  async addTrainingExample(example: TrainingExample) {
    // Calculate score if not provided
    if (!example.score) {
      example.score = example.confidence === 'high' ? 1.0 :
                     example.confidence === 'medium' ? 0.7 : 0.4;
    }

    this.trainingExamples.push(example);

    // Automatically split into training and validation
    const totalExamples = this.trainingExamples.length;
    const validationSize = Math.floor(totalExamples * DSPY_CONFIG.validationSplitRatio);

    if (totalExamples > 10) {
      // Sort by score and take best examples for training
      const sorted = [...this.trainingExamples].sort((a, b) =>
        (b.score || 0) - (a.score || 0)
      );

      this.trainingExamples = sorted.slice(0, -validationSize);
      this.validationExamples = sorted.slice(-validationSize);
    }

    // Add to pipeline's internal training examples
    if (example.expectedAnswer) {
      await this.pipeline.addTrainingExample(
        'answer-generation',
        { query: example.query, docs: example.relevantDocs },
        { answer: example.expectedAnswer, confidence: example.confidence },
        example.score || 0.5
      );
    }
  }

  async optimize(): Promise<OptimizedRAGPipeline> {
    console.log('🔧 Starting TypeScript DSPy optimization...');
    console.log(`📊 Training examples: ${this.trainingExamples.length}`);
    console.log(`📊 Validation examples: ${this.validationExamples.length}`);

    // Bootstrap optimization: Learn from best examples
    await this.bootstrapOptimization();

    // Evaluate performance
    const metrics = await this.evaluatePipeline(this.pipeline);
    console.log('✅ Optimization complete. Metrics:', metrics);

    // Save optimization history
    this.optimizationHistory.push({
      timestamp: new Date(),
      metrics,
      exampleCount: this.trainingExamples.length
    });

    this.compiledPipeline = this.pipeline;
    await this.saveOptimizedPipeline();

    return this.compiledPipeline;
  }

  private async bootstrapOptimization() {
    // Select best examples for each task
    const taskExamples = new Map<string, TrainingExample[]>();

    for (const example of this.trainingExamples) {
      // Categorize by query type
      const queryType = this.categorizeQuery(example.query);

      if (!taskExamples.has(queryType)) {
        taskExamples.set(queryType, []);
      }

      taskExamples.get(queryType)!.push(example);
    }

    // Add best examples from each category to the pipeline
    for (const [queryType, examples] of taskExamples.entries()) {
      const bestExamples = examples
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, DSPY_CONFIG.maxBootstrapExamples);

      console.log(`📚 Adding ${bestExamples.length} examples for ${queryType}`);

      for (const example of bestExamples) {
        await this.pipeline.addTrainingExample(
          queryType,
          { query: example.query },
          { answer: example.expectedAnswer },
          example.score || 0.5
        );
      }
    }
  }

  private categorizeQuery(query: string): string {
    const lower = query.toLowerCase();

    if (lower.includes('invest') || lower.includes('funding') || lower.includes('round')) {
      return 'investment-query';
    } else if (lower.includes('valuation') || lower.includes('worth') || lower.includes('value')) {
      return 'valuation-query';
    } else if (lower.includes('term') || lower.includes('agreement') || lower.includes('contract')) {
      return 'terms-query';
    } else if (lower.includes('company') || lower.includes('portfolio')) {
      return 'company-query';
    }

    return 'general-query';
  }

  private async evaluateExample(example: TrainingExample, prediction: any): Promise<number> {
    const metrics: EvaluationMetrics = {
      relevance: 0,
      completeness: 0,
      accuracy: 0,
      sourceQuality: 0,
      overall: 0
    };

    // Evaluate relevance
    if (prediction.answer && example.query) {
      metrics.relevance = await this.calculateRelevance(
        example.query,
        prediction.answer
      );
    }

    // Evaluate completeness
    if (prediction.sources && prediction.sources.length > 0) {
      metrics.completeness = Math.min(prediction.sources.length / 5, 1);
    }

    // Evaluate accuracy (if we have expected answer)
    if (example.expectedAnswer && prediction.answer) {
      metrics.accuracy = await this.calculateSimilarity(
        example.expectedAnswer,
        prediction.answer
      );
    }

    // Evaluate source quality
    if (prediction.confidence) {
      metrics.sourceQuality =
        prediction.confidence === 'high' ? 1 :
        prediction.confidence === 'medium' ? 0.7 : 0.4;
    }

    // Calculate weighted overall score
    metrics.overall =
      metrics.relevance * EVALUATION_METRICS.relevance.weight +
      metrics.completeness * EVALUATION_METRICS.completeness.weight +
      metrics.accuracy * EVALUATION_METRICS.accuracy.weight +
      metrics.sourceQuality * EVALUATION_METRICS.sourceQuality.weight;

    return metrics.overall;
  }

  private async calculateRelevance(query: string, answer: string): Promise<number> {
    // Simple keyword overlap for now
    const queryTerms = query.toLowerCase().split(/\s+/);
    const answerTerms = answer.toLowerCase().split(/\s+/);

    const overlap = queryTerms.filter(term =>
      answerTerms.includes(term)
    ).length;

    return Math.min(overlap / queryTerms.length, 1);
  }

  private async calculateSimilarity(expected: string, actual: string): Promise<number> {
    // Jaccard similarity
    const expectedTerms = new Set(expected.toLowerCase().split(/\s+/));
    const actualTerms = new Set(actual.toLowerCase().split(/\s+/));

    const intersection = new Set([...expectedTerms].filter(x => actualTerms.has(x)));
    const union = new Set([...expectedTerms, ...actualTerms]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private async evaluatePipeline(pipeline: OptimizedRAGPipeline): Promise<EvaluationMetrics> {
    if (this.validationExamples.length === 0) {
      return {
        relevance: 0,
        completeness: 0,
        accuracy: 0,
        sourceQuality: 0,
        overall: 0
      };
    }

    const results: EvaluationMetrics[] = [];

    for (const example of this.validationExamples) {
      const prediction = await pipeline.forward(example.query);
      const score = await this.evaluateExample(example, prediction);

      results.push({
        relevance: score,
        completeness: score,
        accuracy: score,
        sourceQuality: score,
        overall: score
      });
    }

    // Average metrics
    const avgMetrics: EvaluationMetrics = {
      relevance: results.reduce((a, b) => a + b.relevance, 0) / results.length || 0,
      completeness: results.reduce((a, b) => a + b.completeness, 0) / results.length || 0,
      accuracy: results.reduce((a, b) => a + b.accuracy, 0) / results.length || 0,
      sourceQuality: results.reduce((a, b) => a + b.sourceQuality, 0) / results.length || 0,
      overall: results.reduce((a, b) => a + b.overall, 0) / results.length || 0,
    };

    return avgMetrics;
  }

  private async saveOptimizedPipeline() {
    if (!this.compiledPipeline) return;

    const config = {
      timestamp: new Date().toISOString(),
      examples: this.trainingExamples.length,
      metrics: await this.evaluatePipeline(this.compiledPipeline),
      optimizer: 'TypeScript Native',
      model: DSPY_CONFIG.llm
    };

    console.log('💾 Saving optimized pipeline configuration:', config);

    // In production, save to database or file system
    // For now, keep in memory
  }

  async loadOptimizedPipeline(): Promise<OptimizedRAGPipeline | null> {
    return this.compiledPipeline;
  }

  getCompiledPipeline(): OptimizedRAGPipeline | null {
    return this.compiledPipeline;
  }

  getTrainingExampleCount(): number {
    return this.trainingExamples.length;
  }

  getOptimizationHistory() {
    return this.optimizationHistory;
  }
}