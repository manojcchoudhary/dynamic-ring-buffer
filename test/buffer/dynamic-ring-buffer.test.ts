import { DynamicRingBuffer } from '../../src/index';

describe('DynamicRingBuffer', () => {
    // Non-thread-safe tests
    describe('Non-Thread-Safe Methods', () => {
        it('should enqueue and dequeue items correctly', () => {
            const buffer = new DynamicRingBuffer<number>(3);
            buffer.enqueue(1);
            buffer.enqueue(2);
            expect(buffer.dequeue()).toBe(1);
            expect(buffer.dequeue()).toBe(2);
            expect(buffer.dequeue()).toBeNull();
        });

        it('should flush and reset to initial capacity', () => {
            const buffer = new DynamicRingBuffer<number>(3);
            buffer.enqueue(1);
            buffer.enqueue(2);
            buffer.flush();
            buffer.reset();
            expect(buffer.getCapacity()).toBe(3); // Reset to initial capacity
        });
    });

    // Thread-safe tests
    describe('Thread-Safe Methods', () => {
        it('should enqueue and dequeue items safely', async () => {
            const buffer = new DynamicRingBuffer<number>(3);
            await buffer.enqueueSafe(1);
            await buffer.enqueueSafe(2);
            const item = await buffer.dequeueSafe();
            expect(item).toBe(1);
        });

        it('should flush and reset to initial capacity safely', async () => {
            const buffer = new DynamicRingBuffer<number>(3);
            await buffer.enqueueSafe(1);
            await buffer.enqueueSafe(2);
            await buffer.flushSafe();
            buffer.reset();
            expect(buffer.getCapacity()).toBe(3); // Reset to initial capacity
        });
    });
});
