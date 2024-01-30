import Benchmark from 'benchmark';
import { DynamicRingBuffer } from '../src';
import { BenchmarkResult } from '../src/types';

const testSizes = [10, 100, 1000, 10000, 100000, 1000000, 10000000];
const results: BenchmarkResult[] = [];

for (const testSize of testSizes) {
    const dynamicBuffer = new DynamicRingBuffer<number>(testSize);
    const array: number[] = [];

    // Populate for dequeue/pop benchmarks
    for (let i = 0; i < testSize; i++) {
        dynamicBuffer.enqueue(i);
        array.push(i);
    }

    const suite = new Benchmark.Suite();

    // Enqueue vs Unshift
    suite
        .add(`DynamicRingBuffer enqueue (size ${testSize})`, function () {
            dynamicBuffer.enqueue(1);
        })
        .add(`Array unshift (size ${testSize})`, function () {
            array.unshift(1);
        });

    // Dequeue vs Shift
    suite
        .add(`DynamicRingBuffer dequeue (size ${testSize})`, function () {
            dynamicBuffer.dequeue();
        })
        .add(`Array shift (size ${testSize})`, function () {
            array.shift();
        });

    // Push
    suite
        .add(`DynamicRingBuffer push (size ${testSize})`, function () {
            dynamicBuffer.push(1);
        })
        .add(`Array push (size ${testSize})`, function () {
            array.push(1);
        });

    // Pop
    suite
        .add(`DynamicRingBuffer pop (size ${testSize})`, function () {
            dynamicBuffer.pop();
        })
        .add(`Array pop (size ${testSize})`, function () {
            array.pop();
        });

    // Iterator
    suite
        .add(`DynamicRingBuffer iterator (size ${testSize})`, function () {
            for (const item of dynamicBuffer) {
            }
        })
        .add(`Array iterator (size ${testSize})`, function () {
            for (const item of array) {
            }
        });

    // Unique methods of DynamicRingBuffer
    suite.add(`DynamicRingBuffer flush (size ${testSize})`, function () {
        dynamicBuffer.flush();
    });

    suite.add(`DynamicRingBuffer biForwardIterator (size ${testSize})`, function () {
        const iterator = dynamicBuffer.biForwardIterator();
        while (!iterator.next().done) {}
    });

    suite.add(`DynamicRingBuffer biReverseIterator (size ${testSize})`, function () {
        const iterator = dynamicBuffer.biReverseIterator();
        while (!iterator.next().done) {}
    });

    suite.add(`DynamicRingBuffer reset (size ${testSize})`, function () {
        dynamicBuffer.reset();
    });

    // Multi-threaded benchmarks (simulated)
    suite.add(`DynamicRingBuffer enqueueSafe (size ${testSize})`, async function () {
        await Promise.all(Array.from({ length: testSize }, () => dynamicBuffer.enqueueSafe(1)));
    });

    suite.add(`DynamicRingBuffer dequeueSafe (size ${testSize})`, async function () {
        await Promise.all(Array.from({ length: testSize }, () => dynamicBuffer.dequeueSafe()));
    });

    suite.add(`DynamicRingBuffer flushSafe (size ${testSize})`, async function () {
        await dynamicBuffer.flushSafe();
    });

    suite.add(`DynamicRingBuffer pushSafe (size ${testSize})`, async function () {
        await Promise.all(Array.from({ length: testSize }, () => dynamicBuffer.pushSafe(1)));
    });

    suite.add(`DynamicRingBuffer popSafe (size ${testSize})`, async function () {
        await Promise.all(Array.from({ length: testSize }, () => dynamicBuffer.popSafe()));
    });

    suite.add(`DynamicRingBuffer forwardIteratorSafe (size ${testSize})`, async function () {
        for await (const item of dynamicBuffer.forwardIteratorSafe()) {
        }
    });

    suite.add(`DynamicRingBuffer reverseIteratorSafe (size ${testSize})`, async function () {
        for await (const item of dynamicBuffer.reverseIteratorSafe()) {
        }
    });

    suite.add(`DynamicRingBuffer resetSafe (size ${testSize})`, async function () {
        await dynamicBuffer.resetSafe();
    });

    // Event listeners and suite execution
    suite
        .on('cycle', function (event) {
            results.push({
                testSize,
                name: String(event.target),
                opsPerSecond: event.target.hz,
            });
        })
        .on('complete', function () {
            console.log(`Benchmark (size ${testSize}) finished.`);
            if (testSize === testSizes[testSizes.length - 1]) {
                console.table(results);
            }
        })
        .run({ async: true });
}
