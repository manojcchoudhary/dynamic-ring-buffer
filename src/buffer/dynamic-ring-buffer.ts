/**
 * DynamicRingBuffer is a TypeScript implementation of a dynamic circular buffer (ring buffer).
 * It supports dynamic resizing and provides both thread-safe and non-thread-safe methods.
 * The class offers enqueueing, dequeueing, flushing, and both forward and reverse iteration.
 */

import { BiIterator } from '../types';

class DynamicRingBuffer<T> {
    private buffer: Array<T | null>;
    private head: number;
    private tail: number;
    private capacity: number;
    private initialCapacity: number;
    private lock: Promise<void>;
    private resolveLock: () => void;

    /**
     * Constructs a DynamicRingBuffer object.
     * @param {number} initialCapacity - The initial size of the buffer.
     */
    constructor(initialCapacity: number = 10) {
        this.initialCapacity = initialCapacity;
        this.capacity = initialCapacity;
        this.buffer = new Array<T | null>(this.capacity).fill(null);
        this.head = 0;
        this.tail = 0;
        this.lock = Promise.resolve();
        this.resolveLock = () => {};
    }

    /**
     * Enqueues an item to the buffer. Resizes if full.
     * @param {T} item - The item to enqueue.
     */
    enqueue(item: T): void {
        if (this.isFull()) {
            this.resize(this.capacity * 2);
        }
        this.buffer[this.tail] = item;
        this.tail = (this.tail + 1) % this.capacity;
    }

    /**
     * Dequeues an item from the buffer.
     * @returns {T | null} - The dequeued item or null if the buffer is empty.
     */
    dequeue(): T | null {
        if (this.isEmpty()) {
            return null;
        }
        const item = this.buffer[this.head];
        this.buffer[this.head] = null;
        this.head = (this.head + 1) % this.capacity;
        return item;
    }

    /**
     * Adds an element to the end of the buffer.
     * @param {T} value - The value to add to the buffer.
     */
    push(value: T): void {
        this.buffer[this.tail] = value;
        this.tail = (this.tail + 1) % this.capacity;
        if (this.tail === this.head) {
            // Buffer is full, handle expansion logic here
            this.resize(this.capacity * 2);
        }
    }

    /**
     * Removes and returns the last element from the buffer.
     * @returns {T | null} - The removed element, or null if the buffer is empty.
     */
    pop(): T | null {
        if (this.isEmpty()) {
            return null; // Buffer is empty
        }
        const value = this.buffer[this.head];
        this.buffer[this.head] = null;
        this.head = (this.head + 1) % this.capacity;
        return value;
    }

    /**
     * Flushes a specified number of elements in the specified direction (forward or backward).
     * @param {number} size - The number of elements to flush, defaults to full.
     * @param {boolean} forward - If true, flush elements in the forward direction (from head to tail).
     *                           If false, flush elements in the backward direction (from tail to head).
     * @returns {T[]} - An array containing the flushed elements.
     */
    flush(size: number = this.size(), forward: boolean = true): T[] {
        if (size <= 0) {
            return [];
        }

        const flushedElements: T[] = [];
        let currentIndex = forward ? this.head : this.tail === 0 ? this.capacity - 1 : this.tail - 1;

        while (size > 0 && this.size() > 0) {
            const value = this.buffer[currentIndex];
            if (value !== null && value !== undefined) {
                flushedElements.push(value as T);
                size--;
            }

            if (forward) {
                currentIndex = (currentIndex + 1) % this.capacity;
            } else {
                currentIndex = currentIndex === 0 ? this.capacity - 1 : currentIndex - 1;
            }
        }

        if (forward) {
            this.head = currentIndex;
        } else {
            this.tail = currentIndex === 0 ? this.capacity - 1 : currentIndex + 1;
        }

        return flushedElements;
    }

    /**
     * Checks if the buffer is empty.
     * @returns {boolean} - True if the buffer is empty, false otherwise.
     */
    isEmpty(): boolean {
        return this.size() === 0;
    }

    /**
     * Checks if the buffer is full.
     * @returns {boolean} - True if the buffer is full, false otherwise.
     */
    isFull(): boolean {
        return this.size() === this.capacity;
    }

    /**
     * Returns the current number of elements in the buffer.
     * @returns {number} - The number of elements in the buffer.
     */
    size(): number {
        if (this.tail >= this.head) {
            return this.tail - this.head;
        }
        return this.capacity - this.head + this.tail;
    }

    /**
     * Returns the current capacity of the buffer.
     * @returns {number} - The current capacity of the buffer.
     */
    getCapacity(): number {
        return this.capacity;
    }

    /**
     * Returns an iterator for forward iteration over the elements in the buffer.
     * @returns {Iterator<T>} - An iterator for forward iteration.
     */
    biForwardIterator(): BiIterator<T> {
        let index = this.head;
        const buffer = this.buffer;
        const capacity = this.capacity;

        return {
            next: (): IteratorResult<T> => {
                if (index !== this.tail) {
                    const value = buffer[index];
                    index = (index + 1 + capacity) % capacity;
                    return { value: value as T, done: false };
                } else {
                    return { value: undefined, done: true };
                }
            },
            previous: (): IteratorResult<T> => {
                if (index !== this.head) {
                    index = (index - 1 + capacity) % capacity;
                    const value = buffer[index];
                    return { value: value as T, done: false };
                } else {
                    return { value: undefined, done: true };
                }
            },
        };
    }

    /**
     * Returns an iterator for reverse iteration over the elements in the buffer.
     * @returns {Iterator<T>} - An iterator for reverse iteration.
     */
    biReverseIterator(): BiIterator<T> {
        let index = (this.tail - 1 + this.capacity) % this.capacity;
        const buffer = this.buffer;
        const capacity = this.capacity;

        return {
            next: (): IteratorResult<T> => {
                if (index !== (this.head - 1 + capacity) % capacity) {
                    const value = buffer[index];
                    index = (index - 1 + capacity) % capacity;
                    return { value: value as T, done: false };
                } else {
                    return { value: undefined, done: true };
                }
            },
            previous: (): IteratorResult<T> => {
                index = (index + 1) % capacity;
                if (index !== this.tail) {
                    const value = buffer[index];
                    return { value: value as T, done: false };
                } else {
                    return { value: undefined, done: true };
                }
            },
        };
    }

    /**
     * Thread-safe method to enqueue an item.
     * @param {T} item - The item to enqueue.
     */
    async enqueueSafe(item: T): Promise<void> {
        await this.acquireLock();
        this.enqueue(item);
        this.releaseLock();
    }

    /**
     * Thread-safe method to dequeue an item.
     * @returns {Promise<T | null>} - The dequeued item or null if the buffer is empty.
     */
    async dequeueSafe(): Promise<T | null> {
        await this.acquireLock();
        const item = this.dequeue();
        this.releaseLock();
        return item;
    }

    /**
     * Thread-safe method to flush the buffer and optionally reset its capacity.
     * Flushes a specified number of elements in the specified direction (forward or backward).
     * @param {number} size - The number of elements to flush, defaults to full.
     * @param {boolean} forward - If true, flush elements in the forward direction (from head to tail).
     *                           If false, flush elements in the backward direction (from tail to head).
     * @returns {Promise<T[]>} - The elements that were in the buffer.
     */
    async flushSafe(size: number = this.size(), forward: boolean = true): Promise<T[]> {
        await this.acquireLock();
        const items = this.flush(size, forward);
        this.releaseLock();
        return items;
    }

    /**
     * Thread-safe method to resize the buffer.
     * @param {number} newCapacity - The new capacity of the buffer.
     */
    async resizeSafe(newCapacity: number): Promise<void> {
        await this.acquireLock();
        this.resize(newCapacity);
        this.releaseLock();
    }

    /**
     * Returns a thread-safe forward iterator for the buffer.
     * @returns {AsyncGenerator<T, void, unknown>} - The asynchronous iterator.
     */
    async *forwardIteratorSafe(): AsyncGenerator<T, void, unknown> {
        let index = this.head;
        const capacity = this.capacity;

        while (index !== this.tail) {
            await this.acquireLock();
            const value = this.buffer[index];
            index = (index + 1) % capacity;
            this.releaseLock();
            yield value as T;
        }
    }

    /**
     * Returns a thread-safe reverse iterator for the buffer.
     * @returns {AsyncGenerator<T, void, unknown>} - The asynchronous iterator.
     */
    async *reverseIteratorSafe(): AsyncGenerator<T, void, unknown> {
        let index = (this.tail - 1 + this.capacity) % this.capacity;
        const capacity = this.capacity;

        while (index !== (this.head - 1 + capacity) % capacity) {
            await this.acquireLock();
            const value = this.buffer[index];
            index = (index - 1 + capacity) % capacity;
            this.releaseLock();
            yield value as T;
        }
    }

    /**
     * Adds an element to the end of the buffer in a thread-safe manner.
     * @param {T} value - The value to add to the buffer.
     */
    async pushSafe(value: T): Promise<void> {
        await this.acquireLock();
        this.push(value);
        this.releaseLock();
    }

    /**
     * Removes and returns the last element from the buffer in a thread-safe manner.
     * @returns {T | null} - The removed element, or null if the buffer is empty.
     */
    async popSafe(): Promise<T | null> {
        await this.acquireLock();
        const value = this.pop();
        this.releaseLock();
        return value;
    }

    /**
     * Resets the buffer to its initial capacity and clears all elements in a thread-safe manner.
     */
    async resetSafe() {
        await this.acquireLock();
        this.reset();
        await this.releaseLock();
    }

    /**
     * Acquires a lock for thread-safe operations.
     */
    private async acquireLock(): Promise<void> {
        await this.lock;
        this.lock = new Promise<void>(resolve => {
            this.resolveLock = resolve;
        });
    }

    /**
     * Releases the lock after thread-safe operations.
     */
    private releaseLock(): void {
        this.resolveLock();
    }

    /**
     * Resizes the buffer to a new capacity.
     * @param {number} newCapacity - The new capacity of the buffer.
     */
    private resize(newCapacity: number): void {
        let newBuffer = new Array<T | null>(newCapacity).fill(null);
        let currentSize = this.size();
        for (let i = 0; i < currentSize; i++) {
            newBuffer[i] = this.buffer[(this.head + i) % this.capacity];
        }
        this.buffer = newBuffer;
        this.capacity = newCapacity;
        this.head = 0;
        this.tail = currentSize % newCapacity;
    }

    /**
     * Resets the buffer to its initial capacity and clears all elements.
     */
    reset() {
        this.buffer = new Array<T>(this.initialCapacity);
        this.head = 0;
        this.tail = 0;
    }

    /**
     * Filters the elements in the buffer based on a callback function.
     * @param {Function} callback - A callback function that tests each element in the buffer.
     * @returns {T[]} - An array containing the filtered elements.
     */
    filter(callback: (value: T, index: number, array: T[]) => boolean): T[] {
        return this.filter(callback);
    }

    /**
     * Maps each element in the buffer to a new value using a callback function.
     * @param {Function} callback - A callback function that transforms each element in the buffer.
     * @returns {U[]} - An array containing the mapped values.
     */
    map<U>(callback: (value: T, index: number, array: T[]) => U): U[] {
        return this.map(callback);
    }

    /**
     * Reduces the elements in the buffer to a single value using a callback function and an initial accumulator value.
     * @param {Function} callback - A callback function that combines the elements.
     * @param {any} initialValue - The initial accumulator value.
     * @returns {any} - The reduced value.
     */
    reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U {
        return this.reduce(callback, initialValue);
    }

    /**
     * Returns an iterator for the elements in the buffer.
     */
    *[Symbol.iterator](): IterableIterator<T> {
        let currentIndex = this.head;
        while (currentIndex !== this.tail) {
            const value = this.buffer[currentIndex];
            if (value !== null) {
                yield value;
            }
            currentIndex = (currentIndex + 1) % this.capacity;
        }
    }
}

export default DynamicRingBuffer;
