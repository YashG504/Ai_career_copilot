import NodeCache from 'node-cache';

// Cache instance with 5 minutes (300 seconds) standard TTL, and delete check every 1 minute
const myCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const getFromCache = <T>(key: string): T | undefined => {
  return myCache.get<T>(key);
};

export const setInCache = <T>(key: string, value: T, ttlSeconds: number = 300): boolean => {
  return myCache.set(key, value, ttlSeconds);
};

export const delFromCache = (key: string): number => {
  return myCache.del(key);
};

export const clearCache = (): void => {
  myCache.flushAll();
};

export default myCache;
