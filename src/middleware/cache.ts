import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const cacheMiddleware = (duration: number = 300) => {
  return (req: any, res: any, next: any): void => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const key = `__express__${req.originalUrl}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.json(cachedResponse);
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      cache.set(key, body, duration);
      return originalJson(body);
    };

    next();
  };
};

export const clearCache = (pattern?: string) => {
  if (pattern) {
    const keys = cache.keys().filter(k => k.includes(pattern));
    keys.forEach(k => cache.del(k));
  } else {
    cache.flushAll();
  }
};

export default cache;
