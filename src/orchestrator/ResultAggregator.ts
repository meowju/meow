// Result collection and synthesis

import { Task, TaskResult } from './Task';

export interface AggregationConfig {
  maxOutputLength: number;
}

export interface AggregatedResult {
  success: boolean;
  summary: string;
  taskResults: TaskResult[];
  failedTasks: TaskResult[];
  artifacts: Array<{ taskId: string; path: string; operation: string }>;
  duration: number;
}

export class ResultAggregator {
  private config: AggregationConfig;

  constructor(config: AggregationConfig = { maxOutputLength: 10000 }) {
    this.config = config;
  }

  async aggregate(
    results: Map<string, TaskResult>,
    originalRequest: string,
    synthesize: boolean = true
  ): Promise<AggregatedResult> {
    const taskResults = Array.from(results.values());
    const startTime = Date.now();

    const failedTasks = taskResults.filter(r => !r.success);
    const successfulTasks = taskResults.filter(r => r.success);

    const artifacts: AggregatedResult['artifacts'] = [];
    for (const result of successfulTasks) {
      if (result.artifacts) {
        for (const artifact of result.artifacts) {
          artifacts.push({
            taskId: result.taskId,
            path: artifact.path,
            operation: artifact.operation,
          });
        }
      }
    }

    let summary: string;

    if (synthesize && taskResults.length > 1) {
      summary = this.summarizeSimple(taskResults);
    } else {
      summary = this.summarizeSimple(taskResults);
    }

    return {
      success: failedTasks.length === 0,
      summary,
      taskResults,
      failedTasks,
      artifacts,
      duration: Date.now() - startTime,
    };
  }

  private summarizeSimple(taskResults: TaskResult[]): string {
    const lines: string[] = [];

    for (const result of taskResults) {
      if (result.success) {
        lines.push(`\n## Task ${result.taskId.slice(0, 8)}: Completed`);
        if (result.output) {
          lines.push(result.output.slice(0, 1000));
          if (result.output.length > 1000) lines.push('...(truncated)');
        }
        if (result.artifacts?.length) {
          lines.push(`Produced: ${result.artifacts.map(a => a.path).join(', ')}`);
        }
      } else {
        lines.push(`\n## Task ${result.taskId.slice(0, 8)}: FAILED`);
        lines.push(result.error || 'Unknown error');
      }
    }

    let summary = lines.join('\n');
    if (summary.length > this.config.maxOutputLength) {
      summary = summary.slice(0, this.config.maxOutputLength) + '\n...(truncated)';
    }

    return summary;
  }

  resolveFileConflicts(
    tasks: Task[],
    results: Map<string, TaskResult>
  ): Map<string, 'use_latest' | 'use_task' | 'conflict'> {
    const fileStates = new Map<string, { taskId: string; timestamp: number }>();
    const conflicts = new Map<string, 'conflict'>();

    for (const task of tasks) {
      const result = results.get(task.id);
      if (!result?.artifacts) continue;

      for (const artifact of result.artifacts) {
        const existing = fileStates.get(artifact.path);
        if (!existing) {
          fileStates.set(artifact.path, { taskId: task.id, timestamp: task.createdAt });
        } else if (existing.timestamp < task.createdAt) {
          if (!conflicts.has(artifact.path)) {
            conflicts.set(artifact.path, 'conflict');
          }
        }
      }
    }

    const resolution = new Map<string, 'use_latest' | 'use_task' | 'conflict'>();
    for (const [path] of fileStates) {
      if (conflicts.has(path)) {
        resolution.set(path, 'conflict');
      } else {
        resolution.set(path, 'use_latest');
      }
    }

    return resolution;
  }
}