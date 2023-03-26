/**
 * @file entry file
 * @author dengxuening
 * @email dengxuening123@gmail.com
 */

/**
 * Tow-way linked list used to implement lru cache
 * and record the priority of data
 */
class LRUNode {
    pre: LRUNode | null;
    next: LRUNode | null;
    key: string;
    constructor(key: string) {
        this.pre = null;
        this.next = null;
        this.key = key;
    }
}

/** Data structure of stored data */
type CacheDataItem = {
    // timestamp(ms)
    expire: number;
    data: any;
    lruNode: LRUNode;
};

/**
 * LRU-based cache management, stored in RAM. This implementation stores data in Map
 * and records the priority of data in two-way linked list.
 */
export default class LRUMemoryCache {
    /** The amount of cached data */
    size: number;

    /** The capacity of the cache. if the amount of
     * cached data overflow the capacity, the cached data
     * will be cleaned according to the LRU principle
     * */
    capacity: number;

    /** Data is stored in this Map */
    private cacheData: Map<unknown, CacheDataItem>;

    /** The head of the two-way linked list. */
    private lruHead: LRUNode | null;

    /** The tail of the two-way linked list. */
    private lruTail: LRUNode | null;

    /**
     * Default valid time of stored data, in seconds
     * For example: 10, means that the data cannot be got after 10 seconds.
     * This value can be overridden when calling the {@link #put} method.
     * If the value = 0, the data will never expire due to time.
     * It will only be deleted because of the amount of the data
     * exceeds the capacity and the data is the oldest.
     * */
    private readonly defaultDurationTime: number;


    /**
     * @param config
     * @param {number} config.capacity The capacity of the cache
     * @param {number} config.defaultDurationTime Default valid time of stored data, when value = 0, the data will never expire.
     * It will only be deleted because of the amount of the data exceeds the capacity and the data is the oldest.
     */
    constructor (config?: {capacity?: number, defaultDurationTime?: number}) {
        const conf = Object.assign({
            capacity: 1000,
            defaultDurationTime: 0
        }, config);
        if (conf.capacity < 3) {
            throw new Error('Capacity must >= 3');
        }
        this.size = 0;
        this.capacity = conf.capacity;
        this.cacheData = new Map();
        this.lruHead = null;
        this.lruTail = null;
        this.defaultDurationTime = conf.defaultDurationTime;
    }

    /**
     * Store data
     * @param {any} key key
     * @param {unknown} value value
     * @param duration The valid time of the data. This value will overridden the {@link #defaultDurationTime}
     */
    put(key: any, value: unknown, duration?: number): void {
        const dataValidTime = duration ?? this.defaultDurationTime;

        // If the key already exists
        if (this.cacheData.has(key)) {
            // Clean the old data.
            this.deleteLRUNode(this.cacheData.get(key)!.lruNode);
        } else {
            this.size++;
        }

        const lruNode = new LRUNode(key);
        const data = {
            expire: dataValidTime === 0 ? 0 : Date.now() + dataValidTime * 1000,
            data: value,
            lruNode: lruNode
        };

        this.cacheData.set(key, data);

        // Place the most recent data at the beginning of the two-way linked list.
        if (this.lruHead) {
            this.lruHead.pre = lruNode;
            lruNode.next = this.lruHead;
            this.lruHead = lruNode;
        } else {
            this.lruHead = lruNode;
            this.lruTail = lruNode;
        }
        this.deleteOldestData();
    }

    /**
     * Get data
     * If the data has expired or does not existed, null will be returned.
     * @param {any} key
     * @return {T} stored data
     */
    get<T>(key: unknown): T | null {
        if (this.cacheData.has(key)) {
            const cacheInfo = this.cacheData.get(key);
            if (LRUMemoryCache.isDataValid(cacheInfo!)) {
                // Update data priority:
                // move the node to the two-way linked list header
                if (cacheInfo!.lruNode !== this.lruHead) {
                    this.deleteLRUNode(cacheInfo!.lruNode);
                    this.lruHead!.pre = cacheInfo!.lruNode;
                    cacheInfo!.lruNode.next = this.lruHead;
                    this.lruHead = cacheInfo!.lruNode;
                }
                return cacheInfo?.data;
            } else {
                this.deleteLRUNode(cacheInfo!.lruNode);
                this.cacheData.delete(key);
                return null;
            }
        } else {
            return null;
        }
    }

    /**
     * check whether the data exists and has not expired
     * @param key
     */
    has(key: unknown): boolean {
        if (!this.cacheData.has(key)) {
            return false;
        } else {
            return LRUMemoryCache.isDataValid(this.cacheData.get(key)!);
        }
    }

    /**
     * check whether the data has not expired
     * @private
     * @param {CacheDataItem} data
     * @returns {boolean}
     */
    private static isDataValid(data: CacheDataItem): boolean {
        return data.expire === 0
            || Date.now() - data.expire < 0;
    }

    /**
     * delete data
     * @param key
     */
    delete(key: unknown): void {
        if (this.cacheData.has(key)) {
            const cacheInfo = this.cacheData.get(key);
            this.deleteLRUNode(cacheInfo!.lruNode);
            this.cacheData.delete(key);
            this.size--;
        }
    }

    /**
     * delete all data
     */
    clear() {
        this.cacheData.clear();
        this.lruHead = null;
        this.lruTail = null;
        this.size = 0;
    }

    /**
     * Delete the oldest data
     * Attention: Since the capacity is greater or equal to 3,
     * the boundary case is not considered here.
     * @private
     */
    private deleteOldestData() {
        if (this.size > this.capacity) {
            if (this.lruTail) {

                // Delete the tail node of the two-way linked list
                const deletedNode = this.lruTail;
                this.lruTail = deletedNode.pre;
                this.lruTail!.next = null;
                deletedNode.pre = null;

                this.cacheData.delete(deletedNode.key);
                this.size--;
            }
        }
    }

    /**
     * Delete a node in the two-way linked list
     * @param node The deleted node
     * @private
     */
    private deleteLRUNode(node: LRUNode): void {
        const preNode = node.pre;
        const nextNode = node.next;
        if (nextNode && preNode) {
            nextNode.pre = preNode;
            preNode.next = nextNode;
        } else if (nextNode){
            // The node is a header node
            nextNode.pre = null;
            this.lruHead = nextNode;
        } else if (preNode) {
            // The node is a tail node
            preNode.next = null;
            this.lruTail = preNode;
        }
        node.pre = null;
        node.next = null;
    }

    /**
     * @private
     * For debug only
     * return the details of two-way linked list
     */
    inspect() {
        const lruNodeKeys = [];
        if (this.lruHead) {
            let currentNode: LRUNode | null = this.lruHead;
            while(currentNode) {
                lruNodeKeys.push(currentNode.key);
                currentNode = currentNode.next;
            }
        }
        return JSON.stringify(lruNodeKeys);
    }
}
