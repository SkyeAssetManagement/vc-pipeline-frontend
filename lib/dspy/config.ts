export interface DSPyConfig {
  llm: string;
  retriever: string;
  optimizer: string;
  maxBootstrapExamples: number;
  validationSplitRatio: number;
}

export const DSPY_CONFIG: DSPyConfig = {
  llm: 'claude-sonnet-4-5-20250929',
  retriever: 'weaviate-hybrid',
  optimizer: 'BootstrapFewShotWithRandomSearch',
  maxBootstrapExamples: 20,
  validationSplitRatio: 0.2,
};

export const EVALUATION_METRICS = {
  relevance: {
    weight: 0.3,
    threshold: 0.7,
  },
  completeness: {
    weight: 0.25,
    threshold: 0.6,
  },
  accuracy: {
    weight: 0.25,
    threshold: 0.8,
  },
  sourceQuality: {
    weight: 0.2,
    threshold: 0.5,
  },
};

export const OPTIMIZATION_TRIGGERS = {
  modelChange: true,
  performanceDrop: true,
  scheduleInterval: 24 * 60 * 60 * 1000, // 24 hours
  minExamplesForRetraining: 50,
  performanceDropThreshold: 0.15,
};