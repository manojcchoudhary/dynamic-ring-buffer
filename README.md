# DynamicRingBuffer Class Documentation

## How to install

```shell
$ npx install dynamic-ring-buffer
```

## How to use

```typescript
import { DynamicRingBuffer } from 'dynamic-ring-buffer';
```

## Overview
The `DynamicRingBuffer` class is a generic implementation of a dynamic circular buffer (ring buffer) in TypeScript. 
It provides thread-safe and non-thread-safe methods for enqueueing, dequeueing, and iterating over elements. 
The buffer dynamically resizes when full and offers both forward and reverse iteration capabilities.

## Constructor

```typescript
constructor(initialCapacity: number = 10, options?: DynamicRingBufferOptions)
```

- `initialCapacity` (number): Initial size of the buffer.
- `options` (DynamicRingBufferOptions): Optional configuration object. The only option available is `resetToInitialCapacity`, 
  which determines if the buffer should resize to its initial capacity on flush.

## Methods

### Non-Thread-Safe Methods

- `enqueue(item: T): void`  
  Enqueues an item at the end of the buffer. If the buffer is full, it is resized to double its current capacity.

- `dequeue(): T | null`  
  Dequeues an item from the front of the buffer. Returns `null` if the buffer is empty.

- `flush(): T[]`  
  Clears the buffer and returns an array of all elements that were in it. If `resetToInitialCapacity` is true, 
  the buffer is resized to its initial capacity.

- `isEmpty(): boolean`  
  Checks if the buffer is empty.

- `isFull(): boolean`  
  Checks if the buffer is full.

- `size(): number`  
  Returns the current number of elements in the buffer.

- `getCapacity(): number`  
  Returns the current capacity of the buffer.

### Thread-Safe Methods

- `async enqueueSafe(item: T): Promise<void>`  
  Thread-safe version of `enqueue`.

- `async dequeueSafe(): Promise<T | null>`  
  Thread-safe version of `dequeue`.

- `async flushSafe(): Promise<T[]>`  
  Thread-safe version of `flush`.

### Iterators

- `forwardIterator(): Iterator<T>`  
  Returns an iterator that traverses the buffer from head to tail.

- `reverseIterator(): Iterator<T>`  
  Returns an iterator that traverses the buffer from tail to head.

- `async *forwardIteratorSafe(): AsyncGenerator<T, void, unknown>`  
  Returns a thread-safe asynchronous iterator that traverses the buffer from head to tail.

- `async *reverseIteratorSafe(): AsyncGenerator<T, void, unknown>`  
  Returns a thread-safe asynchronous iterator that traverses the buffer from tail to head.

## Example Usage

```typescript
// Creating a DynamicRingBuffer instance
const buffer = new DynamicRingBuffer<number>(5);

// Enqueueing items
buffer.enqueue(1);
buffer.enqueue(2);
buffer.enqueue(3);

// Dequeueing an item
const item = buffer.dequeue(); // item = 1

// Using the forward iterator
for (const val of buffer.forwardIterator()) {
    console.log(val);
}

// Using the thread-safe forward iterator
async function iterateBuffer() {
    for await (const val of buffer.forwardIteratorSafe()) {
        console.log(val);
    }
}
iterateBuffer();
```

## Notes

- The thread-safe methods (`enqueueSafe`, `dequeueSafe`, `flushSafe`, and the safe iterators) are designed for use in environments 
  with asynchronous operations that might access the buffer concurrently.
- The `DynamicRingBuffer` class does not implement traditional thread synchronization mechanisms due to the single-threaded nature 
  of JavaScript/TypeScript. The thread safety provided is based on asynchronous operation synchronization, suitable for Node.js 
  or similar environments.
- Iterators (`forwardIterator` and `reverseIterator`) provide bidirectional traversal but should not be used concurrently in 
  asynchronous contexts. For thread-safe iteration in such cases, use the asynchronous iterators (`forwardIteratorSafe` and `reverseIteratorSafe`).


# Use Cases of DynamicRingBuffer in Real-Life Situations

## Overview
The `DynamicRingBuffer` is a versatile data structure useful in various real-world scenarios where a circular buffer with dynamic resizing is beneficial. Its ability to handle varying data sizes and the provision of thread-safe operations makes it suitable for concurrent applications. Below are some practical use cases.

## Use Cases

### 1. Networking and Streaming Data
In networking, especially in streaming applications, data packets arrive at unpredictable rates. The `DynamicRingBuffer` can be used to temporarily store packets as they arrive, ensuring that the application can process them at a consistent rate, handling bursts of traffic efficiently.

### 2. Producer-Consumer Problems
In scenarios where one or more producers generate data and one or more consumers process this data, the `DynamicRingBuffer` acts as a shared buffer. Its dynamic nature allows handling varying production rates without data loss.

### 3. Logging Systems
For applications that generate logs at varying rates, the `DynamicRingBuffer` can be used to store log messages before they are written to a file or database. This approach can help in smoothing out I/O operations and prevent loss of log messages during peak activity periods.

### 4. Real-Time Data Processing
In systems that require real-time data processing (such as sensor data in IoT applications), the `DynamicRingBuffer` can store incoming data until it is processed. Its dynamic resizing capability is advantageous when dealing with fluctuating data rates.

### 5. Caching
In caching mechanisms, especially in memory caches, the `DynamicRingBuffer` can manage the cached objects. Its FIFO nature ensures that older cache entries can be overwritten or removed when new data comes in.

### 6. Audio and Video Processing
In multimedia applications, such as audio or video processing, the `DynamicRingBuffer` can be used to buffer streams of audio or video frames. This buffering allows for smooth playback and handling of stream variations.

### 7. Asynchronous Task Queues
In systems where tasks are processed asynchronously, the `DynamicRingBuffer` can manage task queues. This is particularly useful when the task generation rate is variable, and the system needs to ensure no task is lost.

## Conclusion
The `DynamicRingBuffer` is an essential tool for scenarios requiring a flexible and efficient way to handle data streams, asynchronous processing, and dynamic buffering needs. Its thread-safe implementation makes it even more robust for concurrent applications.

