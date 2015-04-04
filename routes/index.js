var express = require('express');
var router = express.Router();
var routerCache = require('../router_cache');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


var demoView = function (req, res) {
    var name = req.query.name || 'default name';
    var data = {
        hello: name
    };

    res.send({message: 'OK', data: data});
}

router.get('/demo', routerCache(demoView, 60*5));

module.exports = router;
