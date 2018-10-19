const redis = require('redis');
const { promisifyAll } = require('bluebird');

promisifyAll(redis);

const PREFIX = 'mem.';

// Use a different cache storage. Must implement the following methods:
//  .has(key),
//  .get(key),
//  .set(key, value),
//  .delete(key),
//  and optionally .clear().
//
//  You could for example use a WeakMap instead or quick-lru for a LRU cache.
//
// Options:
//  ttl: Expiration time in seconds. Default: 60
module.exports = function createRedisMemCache(redisUrl, prefix = '') {
  const redisClient = redis.createClient(redisUrl);

  const asBase64 = value => new Buffer(JSON.stringify(value)).toString('base64');
  const withPrefix = key => `${PREFIX}${prefix}${prefix.length ? '.' : ''}${asBase64(key)}`;
  const has = key => redisClient.existsAsync(withPrefix(key));
  const get = key => redisClient.getAsync(withPrefix(key)).then(_ => (_ ? JSON.parse(_) : _));
  const set = async (key, { data, maxAge }) => {
    const resolved = await data;

    if (maxAge) {
      const ttl = maxAge - +new Date();
      return redisClient.setAsync(withPrefix(key), JSON.stringify(resolved), 'PX', ttl);
    } else {
      return redisClient.setAsync(withPrefix(key), JSON.stringify(resolved));
    }
  };

  const del = key => redisClient.delAsync(withPrefix(key));
  const getAllKeys = () => redisClient.keysAsync(withPrefix('*'));
  const clear = () => getAllKeys.then(keys => Promise.all(key => redisClient.delAsync(key)));

  return { has, get, set, delete: del, clear };
};
