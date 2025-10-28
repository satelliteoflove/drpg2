export interface PriorityQueueItem<T> {
  value: T;
  priority: number;
}

export class PriorityQueue<T> {
  private heap: PriorityQueueItem<T>[] = [];

  public insert(value: T, priority: number): void {
    this.heap.push({ value, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  public extractMin(): T | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop()!.value;

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min.value;
  }

  public peek(): T | null {
    return this.heap.length > 0 ? this.heap[0].value : null;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].priority >= this.heap[parentIndex].priority) break;

      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const lastIndex = this.heap.length - 1;
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild <= lastIndex && this.heap[leftChild].priority < this.heap[smallest].priority) {
        smallest = leftChild;
      }

      if (rightChild <= lastIndex && this.heap[rightChild].priority < this.heap[smallest].priority) {
        smallest = rightChild;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}
