import dspy from 'dspy';
import { OptimizedRAGPipeline } from './modules';
import { DSPY_CONFIG, EVALUATION_METRICS } from './config';
import { tracedOperation } from '../braintrust-enhanced';

export interface TrainingExample {
  query: string;
  expectedAnswer?: string;
  relevantDocs?: string[];
  confidence?: 'high' | 'medium' | 'low';
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
  private optimizer: any;
  private compiledPipeline: OptimizedRAGPipeline | null = null;

  constructor() {
    this.pipeline = new OptimizedRAGPipeline();
    this.trainingExamples = [];
    this.validationExamples = [];
    this.initializeOptimizer();
  }

  private initializeOptimizer() {
    // Initialize DSPy optimizer based on config
    if (DSPY_CONFIG.optimizer === 'BootstrapFewShotWithRandomSearch') {
      this.optimizer = dspy.BootstrapFewShotWithRandomSearch(
        metric=this.evaluateExample.bind(this),
        max_bootstrapped_demos=DSPY_CONFIG.maxBootstrapExamples,
        max_labeled_demos=5,
        num_candidate_programs=10,
        num_threads=4
      );
    } else if (DSPY_CONFIG.optimizer === 'MIPROv2') {
      this.optimizer = dspy.MIPROv2(
        metric=this.evaluateExample.bind(this),
        prompt_model=DSPY_CONFIG.llm,
        task_model=DSPY_CONFIG.llm,
        num_candidates=10,
        init_temperature=0.7
      );
    } else {
      this.optimizer = dspy.BootstrapFewShot(
        metric=this.evaluateExample.bind(this),
        max_bootstrapped_demos=DSPY_CONFIG.maxBootstrapExamples
      );
    }
  }

  async addTrainingExample(example: TrainingExample) {
    this.trainingExamples.push(example);

    // Automatically split into training and validation
    const totalExamples = this.trainingExamples.length;
    const validationSize = Math.floor(totalExamples * DSPY_CONFIG.validationSplitRatio);

    if (totalExamples > 10) {
      this.validationExamples = this.trainingExamples.slice(-validationSize);
      this.trainingExamples = this.trainingExamples.slice(0, -validationSize);
    }
  }

  async optimize(): Promise<OptimizedRAGPipeline> {
    console.log('🔧 Starting DSPy optimization...');
    console.log(`📊 Training examples: ${this.trainingExamples.length}`);
    console.log(`📊 Validation examples: ${this.validationExamples.length}`);

    // Compile the pipeline with optimizer
    this.compiledPipeline = await this.optimizer.compile(
      this.pipeline,
      trainset=this.trainingExamples,
      valset=this.validationExamples
    );

    // Evaluate performance
    const metrics = await this.evaluatePipeline(this.compiledPipeline);
    console.log('✅ Optimization complete. Metrics:', metrics);

    // Save optimized pipeline
    await this.saveOptimizedPipeline();

    return this.compiledPipeline;
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
    // Simple keyword overlap for now - can be enhanced with embeddings
    const queryTerms = query.toLowerCase().split(/\s+/);
    const answerTerms = answer.toLowerCase().split(/\s+/);

    const overlap = queryTerms.filter(term =>
      answerTerms.includes(term)
    ).length;

    return Math.min(overlap / queryTerms.length, 1);
  }

  private async calculateSimilarity(expected: string, actual: string): Promise<number> {
    // Jaccard similarity for now - can be enhanced with semantic similarity
    const expectedTerms = new Set(expected.toLowerCase().split(/\s+/));
    const actualTerms = new Set(actual.toLowerCase().split(/\s+/));

    const intersection = new Set([...expectedTerms].filter(x => actualTerms.has(x)));
    const union = new Set([...expectedTerms, ...actualTerms]);

    return intersection.size / union.size;
  }

  private async evaluatePipeline(pipeline: OptimizedRAGPipeline): Promise<EvaluationMetrics> {
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
      relevance: results.reduce((a, b) => a + b.relevance, 0) / results.length,
      completeness: results.reduce((a, b) => a + b.completeness, 0) / results.length,
      accuracy: results.reduce((a, b) => a + b.accuracy, 0) / results.length,
      sourceQuality: results.reduce((a, b) => a + b.sourceQuality, 0) / results.length,
      overall: results.reduce((a, b) => a + b.overall, 0) / results.length,
    };

    return avgMetrics;
  }

  private async saveOptimizedPipeline() {
    if (!this.compiledPipeline) return;

    // Save the optimized pipeline configuration
    const config = {
      timestamp: new Date().toISOString(),
      examples: this.trainingExamples.length,
      metrics: await this.evaluatePipeline(this.compiledPipeline),
      optimizer: DSPY_CONFIG.optimizer,
      model: DSPY_CONFIG.llm
    };

    // In production, save to database or file system
    console.log('💾 Saving optimized pipeline configuration:', config);
  }

  async loadOptimizedPipeline(): Promise<OptimizedRAGPipeline | null> {
    // Load previously optimized pipeline if exists
    return this.compiledPipeline;
  }

  getCompiledPipeline(): OptimizedRAGPipeline | null {
    return this.compiledPipeline;
  }
}