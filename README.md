# p-memoize-redis

See [p-memoize](https://github.com/sindresorhus/p-memoize)

## Install

`npm install p-memoize-redis`

## Usage

```javascript
const pMemoize = require('p-memoize');
const request = require('request');
const createRedisMemCache = require('p-memoize-redis');
const memGet = pMemoize(request.get, cache: createRedisMemCache(REDIS_URL) });

memGet('http://brekken.com/')
    .then(res => console.log(res))
    .catch(() => process.exit(1));
);
```
