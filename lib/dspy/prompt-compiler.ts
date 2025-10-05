import { ClaudeService } from '../claude';

export interface PromptTemplate {
  task: string;
  examples: Array<{
    input: any;
    output: any;
  }>;
  instruction?: string;
}

export class PromptCompiler {
  private templates: Map<string, PromptTemplate> = new Map();
  private optimizedPrompts: Map<string, string> = new Map();

  async compilePrompt(
    task: string,
    examples: Array<{ input: any; output: any }>,
    instruction?: string
  ): Promise<string> {
    const fewShotExamples = examples
      .slice(0, 5)
      .map((ex, i) => `Example ${i + 1}:\nInput: ${JSON.stringify(ex.input)}\nOutput: ${JSON.stringify(ex.output)}`)
      .join('\n\n');

    const compiledPrompt = `${instruction || ''}

${fewShotExamples}

Now, process the following input:`;

    this.optimizedPrompts.set(task, compiledPrompt);
    return compiledPrompt;
  }

  async optimizeWithExamples(
    task: string,
    examples: Array<{ input: any; output: any; score: number }>
  ): Promise<string> {
    // Select best examples based on score
    const bestExamples = examples
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ input, output }) => ({ input, output }));

    return this.compilePrompt(task, bestExamples);
  }

  getOptimizedPrompt(task: string): string | undefined {
    return this.optimizedPrompts.get(task);
  }
}

export class ChainOfThought<T> {
  private task: string;
  private compiler: PromptCompiler;

  constructor(task: string) {
    this.task = task;
    this.compiler = new PromptCompiler();
  }

  async execute(input: any, examples: Array<{ input: any; output: any }> = []): Promise<T> {
    const prompt = await this.compiler.compilePrompt(
      this.task,
      examples,
      'Think step by step and explain your reasoning.'
    );

    // Use Claude to execute the prompt
    const response = await ClaudeService.generateAnswer(
      `${prompt}\n\nInput: ${JSON.stringify(input)}`,
      [],
      []
    );

    // Parse the response
    try {
      return JSON.parse(response.answer) as T;
    } catch {
      return response.answer as T;
    }
  }
}

export class Predict<T> {
  private task: string;
  private compiler: PromptCompiler;

  constructor(task: string) {
    this.task = task;
    this.compiler = new PromptCompiler();
  }

  async execute(input: any, examples: Array<{ input: any; output: any }> = []): Promise<T> {
    const prompt = await this.compiler.compilePrompt(
      this.task,
      examples,
      'Provide a direct answer without explanation.'
    );

    const response = await ClaudeService.generateAnswer(
      `${prompt}\n\nInput: ${JSON.stringify(input)}`,
      [],
      []
    );

    try {
      return JSON.parse(response.answer) as T;
    } catch {
      return response.answer as T;
    }
  }
}