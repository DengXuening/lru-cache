/**
 * @file test case
 * @author dengxuening
 * @email dengxuening123@gmail.com
 */

import LRUMemoryCache from '../src/index';

describe('LRUMemoryCache Test', () => {

    describe('LRUMemoryCache: init', () => {
        test('init', () => {
            expect(() => {
                new LRUMemoryCache();
            }).not.toThrow(Error);
            expect(() => {
                new LRUMemoryCache({capacity: 3});
            }).not.toThrow(Error);
            expect(() => {
                new LRUMemoryCache({capacity: 2});
            }).toThrow(Error);
        });
    });

    describe('LRUMemoryCache: has', () => {
        test('LRUMemoryCache: init', () => {
            const cm = new LRUMemoryCache();
            cm.put('k1', 1);
            expect(cm.has('k1')).toBe(true);
            expect(cm.has('k2')).toBe(false);
        });
    });

    describe('LRUMemoryCache: put', () => {
        test('put data: 1 item', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            expect(cacheManager.get('k1')).toBe(1);
            expect(cacheManager.inspect()).toBe(JSON.stringify(['k1']));
        });

        test('put data: 2 item', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            expect(cacheManager.get('k1')).toBe(1);
            expect(cacheManager.get('k2')).toBe(2);
            expect(cacheManager.inspect()).toBe(JSON.stringify(['k2', 'k1']));
        });

        test('put data: 3 item', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            cacheManager.put('k3', 3);
            expect(cacheManager.get('k1')).toBe(1);
            expect(cacheManager.get('k2')).toBe(2);
            expect(cacheManager.get('k3')).toBe(3);
            expect(cacheManager.inspect()).toBe(JSON.stringify(['k3', 'k2', 'k1']));
        });

        test('test LRU: exceeds capacity', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            cacheManager.put('k3', 3);
            cacheManager.put('k4', 4);
            cacheManager.put('k5', 5);
            cacheManager.put('k6', 6);
            expect(cacheManager.get('k1')).toBe(null);
            expect(cacheManager.get('k2')).toBe(2);
            expect(cacheManager.get('k3')).toBe(3);
            expect(cacheManager.get('k4')).toBe(4);
            expect(cacheManager.get('k5')).toBe(5);
            expect(cacheManager.get('k6')).toBe(6);
            expect(cacheManager.size).toBe(5);
        });

        test('test LRU: priority - 1', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            cacheManager.put('k3', 3);
            cacheManager.get('k1');
            cacheManager.put('k4', 4);
            cacheManager.put('k5', 5);
            cacheManager.put('k6', 6);
            expect(cacheManager.inspect()).toBe(JSON.stringify(['k6', 'k5', 'k4', 'k1', 'k3']));
            expect(cacheManager.get('k1')).toBe(1);
            expect(cacheManager.get('k2')).toBe(null);
        });

        test('test LRU: priority - 2', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            cacheManager.put('k3', 3);
            cacheManager.get('k2');
            cacheManager.put('k4', 4);
            cacheManager.put('k5', 5);
            cacheManager.get('k5');
            cacheManager.put('k6', 6);
            expect(cacheManager.inspect()).toBe(JSON.stringify(['k6', 'k5', 'k4', 'k2', 'k3']));
            expect(cacheManager.get('k1')).toBe(null);
        });

        test('test LRU: priority - 3', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            cacheManager.put('k3', 3);
            cacheManager.get('k2');
            cacheManager.delete('k3');
            cacheManager.put('k4', 4);
            cacheManager.put('k5', 5);
            cacheManager.get('k2');
            cacheManager.put('k6', 6);
            expect(cacheManager.inspect()).toBe(JSON.stringify(['k6', 'k2', 'k5', 'k4', 'k1']));
            expect(cacheManager.get('k3')).toBe(null);
        });

        test('test LRU: key conflict', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            cacheManager.put('k3', 3);
            cacheManager.get('k2');
            cacheManager.put('k1', 11);
            cacheManager.put('k4', 4);
            expect(cacheManager.inspect()).toBe(JSON.stringify(['k4', 'k1', 'k2', 'k3']));
            expect(cacheManager.size).toBe(4);
        });

        test('global default expire', (done) => {
            const cacheManager = new LRUMemoryCache({capacity: 5, defaultDurationTime: 2});
            cacheManager.put('k1', 1);
            expect(cacheManager.get('k1')).toBe(1);
            setTimeout(() => {
                expect(cacheManager.get('k1')).toBe(null);
                done();
            }, 2500);
        });

        test('global default no expire', (done) => {
            const cacheManager = new LRUMemoryCache({capacity: 5, defaultDurationTime: 0});
            cacheManager.put('k1', 1);
            expect(cacheManager.get('k1')).toBe(1);
            setTimeout(() => {
                expect(cacheManager.get('k1')).toBe(1);
                done();
            }, 1000);
        });

        test('specifical data expire', (done) => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1, 1);
            expect(cacheManager.get('k1')).toBe(1);
            setTimeout(() => {
                expect(cacheManager.get('k1')).toBe(null);
                done();
            }, 1500);
        });

        test('specifical data no expire', (done) => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1, 0);
            expect(cacheManager.get('k1')).toBe(1);
            setTimeout(() => {
                expect(cacheManager.get('k1')).toBe(1);
                done();
            }, 1500);
        });

        test('gloabl default expire + specifical expire: 1', (done) => {
            const cacheManager = new LRUMemoryCache({capacity: 5, defaultDurationTime: 3});
            cacheManager.put('k1', 1, 1);
            expect(cacheManager.get('k1')).toBe(1);
            setTimeout(() => {
                expect(cacheManager.get('k1')).toBe(null);
                done();
            }, 1500);
        });

        test('gloabl default expire + specifical expire: 2', (done) => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            expect(cacheManager.get('k1')).toBe(1);
            setTimeout(() => {
                expect(cacheManager.get('k1')).toBe(1);
                done();
            }, 1500);
        });
    });

    describe('LRUMemoryCache: get', () => {
        test('get: 1 data item', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            expect(cacheManager.get('k1')).toBe(1);

            // 测试再次读取
            expect(cacheManager.get('k1')).toBe(1);
            expect(cacheManager.inspect()).toBe(JSON.stringify(['k1']));
        });
        test('get: head data', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            cacheManager.put('k3', 3);
            expect(cacheManager.get('k1')).toBe(1);
            expect(cacheManager.inspect()).toBe(JSON.stringify(['k1', 'k3', 'k2']));
        });
        test('get: middle data', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            cacheManager.put('k3', 3);
            expect(cacheManager.get('k2')).toBe(2);
            expect(cacheManager.inspect()).toBe(JSON.stringify(['k2', 'k3', 'k1']));
        });
        test('get: tail data', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            cacheManager.put('k3', 3);
            expect(cacheManager.get('k3')).toBe(3);
            expect(cacheManager.inspect()).toBe(JSON.stringify(['k3', 'k2', 'k1']));
        });
    });

    describe('LRUMemoryCache: delete', () => {
        test('clear data: 1 item', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.clear();
            expect(cacheManager.get('k1')).toBe(null);
            expect(cacheManager.size).toBe(0);
        });

        test('clear data: N item', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            cacheManager.put('k3', 3);
            cacheManager.clear();
            expect(cacheManager.get('k1')).toBe(null);
            expect(cacheManager.get('k2')).toBe(null);
            expect(cacheManager.get('k3')).toBe(null);
            expect(cacheManager.size).toBe(0);
        });

        test('clear data', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            cacheManager.put('k3', 3);
            expect(cacheManager.size).toBe(3);
            cacheManager.clear();
            expect(cacheManager.get('k1')).toBe(null);
            expect(cacheManager.get('k2')).toBe(null);
            expect(cacheManager.get('k3')).toBe(null);
            expect(cacheManager.size).toBe(0);
        });

        test('delete data: delete middle', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            cacheManager.put('k3', 3);
            cacheManager.delete('k2');
            expect(cacheManager.size).toBe(2);
            expect(cacheManager.get('k1')).toBe(1);
            expect(cacheManager.get('k2')).toBe(null);
            expect(cacheManager.get('k3')).toBe(3);
        });

        test('delete data: delete head', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            cacheManager.put('k3', 3);
            cacheManager.delete('k1');
            expect(cacheManager.size).toBe(2);
            expect(cacheManager.get('k1')).toBe(null);
            expect(cacheManager.get('k2')).toBe(2);
            expect(cacheManager.get('k3')).toBe(3);
        });


        test('delete data: delete tail', () => {
            const cacheManager = new LRUMemoryCache({capacity: 5});
            cacheManager.put('k1', 1);
            cacheManager.put('k2', 2);
            cacheManager.put('k3', 3);
            cacheManager.delete('k3');
            expect(cacheManager.size).toBe(2);
            expect(cacheManager.get('k1')).toBe(1);
            expect(cacheManager.get('k2')).toBe(2);
            expect(cacheManager.get('k3')).toBe(null);
        });
    });

    describe('Pressure Test', () => {
        test('random test: big data', () => {
            expect(() => {
                function randomKey(keyList: string[]) {
                    const l = keyList.length;
                    const i = Math.floor(Math.random() * l);
                    return keyList[i];
                }
                const testKeys: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't'];
                const cm = new LRUMemoryCache({capacity: 15});
                for (let i = 0; i < 1000; i++) {
                    const k = randomKey(testKeys);
                    cm.put(k, { a: 1, b: 2 }, 10);
                    if (Math.random() > 0.4) {
                        const kl = randomKey(testKeys);
                        cm.get(kl);
                    }
                }
            }).not.toThrow(Error);
        });

        test('random test: CRUD', () => {
            const cm = new LRUMemoryCache({capacity: 5});
            cm.put('k1', 1);
            cm.put('k2', 2);
            cm.put('k3', 3);
            cm.get('k2');
            cm.put('k4', 4);
            cm.put('k1', 11);
            cm.delete('k3');
            cm.put('k5', 5);
            expect(cm.size).toBe(4);
            expect(cm.get('k1')).toBe(11);
            expect(cm.get('k3')).toBe(null);
            expect(cm.get('k2')).toBe(2);
            expect(cm.inspect()).toBe(JSON.stringify(['k2', 'k1', 'k5', 'k4']));
        });
    });
});
