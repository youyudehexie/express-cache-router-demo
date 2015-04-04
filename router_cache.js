var crypto = require('crypto');
var redisQueue = require('./lib/redis_server');

var md5 = function (str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
}


module.exports = function (fn, t) {
    var expiredTime = t || 5000;
    return function (req, res, next) {
        var send = res.send;

        var method = req.method;
        var url = req.url;
        var query;

        if (method === 'GET') {
            query = req.query;
        } else {
            query = req.body;
        }

        var key = md5([method, url, JSON.stringify(query)].join(':'));
        redisQueue.get(key, function (err, value) {
            if (err) {
                return next(err);
            }

            if (value) {
                var data = value;
                try {
                    data = JSON.parse(data);
                } catch (err) {
                    console.log(err);
                }

                console.log('Read data from redis.');

                return res.send(data);
            }

            res.send = function (data) {
                redisQueue.setex(key, expiredTime, JSON.stringify(data));
                return send.call(this, data);
            }

            return fn.call(null, req, res);
        });
    }

}
