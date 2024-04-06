import { ForbiddenException, Injectable } from '@nestjs/common';
import { SseService } from './sse/sse.service';

const _BATCH_SIZE = 2;

@Injectable()
export class AppService {
  constructor(private readonly sseService: SseService) {}

  get(token: string) {
    if (this.sseService.isEventActive(token)) {
      throw new ForbiddenException(
        'This user cannot request this route more than once at the same time.',
      );
    }

    const promises = this.getPromises();
    const batchSize = _BATCH_SIZE;
    return this.resolveBatchPromises(promises, batchSize, token);
  }

  private getPromises() {
    const fakePromises = [];
    for (let i = 0; i < 10; i++) {
      fakePromises.push(
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(`Fake promise ${i + 1} resolved`);
          }, 2000);
        }),
      );
    }
    return fakePromises;
  }

  private async resolveBatchPromises<T>(
    promises: Promise<T>[],
    batchSize: number,
    token: string,
  ): Promise<T[]> {
    const promisesSize = promises.length;
    const totalBatches = Math.ceil(promisesSize / batchSize);
    const resolvedResults: T[] = [];

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, promisesSize);
      this.emitPercentageProgress(token, promisesSize, end);
      const batchPromises = promises.slice(start, end);
      const batchResults = await Promise.all(batchPromises);
      resolvedResults.push(...batchResults.filter(Boolean));
    }

    this.sseService.clearEvent(token);

    return resolvedResults;
  }

  private emitPercentageProgress(
    token: string,
    promisesSize: number,
    end: number,
  ) {
    const percentage = ((100 * end) / promisesSize).toFixed(2);
    const message =
      end > promisesSize
        ? `Processing 100% of inputs.`
        : `Processing ${promisesSize} batches (${percentage}% of inputs).`;

    this.sseService.emitEvent(token, { data: message });
  }
}
