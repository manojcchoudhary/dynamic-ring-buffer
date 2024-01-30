export interface BiIterator<T, TReturn = any, TNext = undefined, TPrevious = undefined> extends Iterator<T, TReturn, TNext> {
    previous(...args: [] | [TPrevious]): IteratorResult<T, TReturn>;
}

export interface BiAsyncGenerator<T = unknown, TReturn = any, TNext = unknown, TPrevious = unknown>
    extends AsyncGenerator<T, TReturn, TNext> {
    pervious(...args: [] | [TPrevious]): Promise<IteratorResult<T, TReturn>>;
}

export interface BenchmarkResult {
    testSize: number;
    name: string;
    opsPerSecond: unknown;
}
