# LRU Cache

This is a basic and lightweight LRU caching tool that is implemented using RAM. 
The tool uses a least-recently-used (LRU) algorithm to manage its cache, which means that it discards 
the least recently used items when the cache reaches its capacity limit. It uses two-way linked list to record 
priority of data, which ensures its supervisor performance.

## Installation
```shell
npm i @dengxuening/lru-cache
```

## Usage

```js
import LRUMemoryCache from "lru-cache";

const lruCache = new LRUMemoryCache({
    // The capacity of cache.
    capacity: 1000,
    
    // Default duration time. If the time exceeds, the value will be cleared
    // If value is 0, value won't expire. If the value is 10 seconds, 
    // the value cannot be obtained after putting it for 10 seconds
    defaultDurationTime: 0
});

// put data
lruCache.put('key1', 'Bar');

// You will not be able to obtain this value after 10 seconds 
lruCache.put('key2', 'Foo', 10);

// get data
lruCache.get('key1');
// Bar

// delete data
lruCache.delete('key1');

// Clear all data
lruCache.clear();
```
