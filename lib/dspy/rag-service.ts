import { OptimizedRAGPipeline } from './modules-native';
import { DSPyOptimizer, TrainingExample } from './optimizer-native';
import { WeaviateService } from '../weaviate';
import { ClaudeService } from '../claude';
import { tracedOperation } from '../braintrust-enhanced';
import { OPTIMIZATION_TRIGGERS } from './config';

export class DSPyEnhancedRAGService {
  private optimizer: DSPyOptimizer;
  private pipeline: OptimizedRAGPipeline | null = null;
  private weaviateService: WeaviateService;
  private lastOptimizationTime: Date | null = null;
  private performanceHistory: number[] = [];
  private currentModelVersion: string = 'claude-sonnet-4-20250514';

  constructor() {
    this.optimizer = new DSPyOptimizer();
    this.weaviateService = new WeaviateService();
    this.initializePipeline();
  }

  private async initializePipeline() {
    // Try to load existing optimized pipeline
    this.pipeline = await this.optimizer.loadOptimizedPipeline();

    if (!this.pipeline) {
      // Use default pipeline if no optimized version exists
      this.pipeline = new OptimizedRAGPipeline();
      console.log('📦 Using default RAG pipeline (not optimized yet)');
    } else {
      console.log('✅ Loaded optimized RAG pipeline');
    }
  }

  async search(query: string, filters?: any, userId?: string, sessionId?: string) {
    // Ensure pipeline is initialized
    if (!this.pipeline) {
      await this.initializePipeline();
    }

    // Track operation with Braintrust
    const result = await tracedOperation(
      'dspy-enhanced-search',
      async () => {
        // Use DSPy-optimized pipeline
        const pipelineResult = await this.pipeline!.forward(query, filters);

        // Format response for API compatibility
        return {
          query: pipelineResult.query,
          enhancedQuery: pipelineResult.enhancedQuery,
          intent: pipelineResult.intent,
          entities: pipelineResult.entities,
          results: pipelineResult.documents,
          answer: pipelineResult.answer,
          sources: pipelineResult.sources,
          confidence: pipelineResult.confidence,
          totalResults: pipelineResult.documents.length
        };
      },
      {
        input: query,
        userId,
        sessionId,
        feature: 'dspy-optimized-rag',
        filters
      },
      (response) => {
        // Calculate performance metrics
        const score = this.calculatePerformanceScore(response);
        this.performanceHistory.push(score);

        // Check if reoptimization is needed
        this.checkOptimizationTriggers(score);

        return {
          relevance: score,
          confidenceScore: response.confidence === 'high' ? 1 :
                          response.confidence === 'medium' ? 0.7 : 0.4,
          resultCount: response.totalResults / 20
        };
      }
    );

    // Collect training example for future optimization
    await this.collectTrainingExample(query, result);

    return result;
  }

  private calculatePerformanceScore(response: any): number {
    let score = 0;

    // Score based on confidence
    score += response.confidence === 'high' ? 0.4 :
             response.confidence === 'medium' ? 0.25 : 0.1;

    // Score based on result count
    score += Math.min(response.totalResults / 20, 0.3);

    // Score based on sources
    score += Math.min(response.sources?.length / 5, 0.3);

    return score;
  }

  private async checkOptimizationTriggers(currentScore: number) {
    const shouldOptimize = false;

    // Check performance drop
    if (OPTIMIZATION_TRIGGERS.performanceDrop && this.performanceHistory.length > 10) {
      const recentAvg = this.performanceHistory.slice(-5).reduce((a, b) => a + b, 0) / 5;
      const historicalAvg = this.performanceHistory.slice(-20, -10).reduce((a, b) => a + b, 0) / 10;

      if (recentAvg < historicalAvg * (1 - OPTIMIZATION_TRIGGERS.performanceDropThreshold)) {
        console.log('⚠️ Performance drop detected. Triggering reoptimization...');
        await this.triggerOptimization();
        return;
      }
    }

    // Check scheduled interval
    if (OPTIMIZATION_TRIGGERS.scheduleInterval && this.lastOptimizationTime) {
      const timeSinceLastOpt = Date.now() - this.lastOptimizationTime.getTime();
      if (timeSinceLastOpt > OPTIMIZATION_TRIGGERS.scheduleInterval) {
        console.log('⏰ Scheduled optimization triggered');
        await this.triggerOptimization();
        return;
      }
    }
  }

  private async collectTrainingExample(query: string, result: any) {
    // Collect successful searches as training examples
    if (result.confidence === 'high' && result.sources?.length > 0) {
      const example: TrainingExample = {
        query,
        expectedAnswer: result.answer,
        relevantDocs: result.sources.map((s: any) => s.id),
        confidence: result.confidence
      };

      await this.optimizer.addTrainingExample(example);

      // Check if we have enough examples for optimization
      const exampleCount = this.getTrainingExampleCount();
      if (exampleCount >= OPTIMIZATION_TRIGGERS.minExamplesForRetraining &&
          !this.lastOptimizationTime) {
        console.log(`📊 Collected ${exampleCount} examples. Ready for optimization.`);
        await this.triggerOptimization();
      }
    }
  }

  async triggerOptimization() {
    console.log('🚀 Starting DSPy optimization process...');

    try {
      // Run optimization
      const optimizedPipeline = await this.optimizer.optimize();

      // Update pipeline
      this.pipeline = optimizedPipeline;
      this.lastOptimizationTime = new Date();

      console.log('✅ Pipeline optimization complete');

      // Reset performance history
      this.performanceHistory = [];

    } catch (error) {
      console.error('❌ Optimization failed:', error);
    }
  }

  async handleModelChange(newModel: string) {
    if (OPTIMIZATION_TRIGGERS.modelChange && newModel !== this.currentModelVersion) {
      console.log(`🔄 Model change detected: ${this.currentModelVersion} -> ${newModel}`);
      this.currentModelVersion = newModel;

      // Trigger reoptimization for new model
      await this.triggerOptimization();
    }
  }

  getTrainingExampleCount(): number {
    return this.optimizer.getTrainingExampleCount();
  }

  async manualOptimize() {
    // Allow manual optimization trigger
    await this.triggerOptimization();
  }

  getPipelineStatus() {
    return {
      isOptimized: this.lastOptimizationTime !== null,
      lastOptimized: this.lastOptimizationTime,
      performanceScore: this.performanceHistory.length > 0 ?
        this.performanceHistory[this.performanceHistory.length - 1] : null,
      trainingExamples: this.getTrainingExampleCount(),
      currentModel: this.currentModelVersion
    };
  }
}