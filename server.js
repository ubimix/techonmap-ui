var _ = require('underscore');
var Mosaic = require('mosaic-commons');
require('mosaic-teleport');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var ServiceStubProvider = require('mosaic-teleport-server').ServiceStubProvider;

var defaultPort = 3701;
var serviceOptions = _.extend({
    port : defaultPort
}, ServiceStubProvider.toOptions(process.argv), {
    path : '/api',
    dir : __dirname + '/service/api',
});
var port = (+serviceOptions.port) || defaultPort;

/* ------------------------------------------------------- */
// Creates and initializes an Express application
var app = express();
app.use(bodyParser.urlencoded({
    extended : false
}));
app.use(bodyParser.json());
app.use(cookieParser());

/* ------------------------------------------------------- */
function redirect(network, res) {
    res.redirect('/logged-in.html?from=' + network);
}
app.get('/api/auth/linkedin', function(req, res) {
    redirect('linkedin', res);
});
app.get('/api/auth/twitter', function(req, res) {
    redirect('twitter', res);
});
app.get('/api/auth/facebook', function(req, res) {
    redirect('facebook', res);
});
app.get('/api/auth/google', function(req, res) {
    redirect('google', res);
});
/* ------------------------------------------------------- */
var userInfoKey = 'user';
app.get('/api/logout', function(req, res) {
    res.clearCookie(userInfoKey);
    res.json({});
});
app.get('/api/auth/user', function(req, res) {
    function readUser(str, defaultValue) {
        var user = defaultValue;
        try {
            user = JSON.parse(str);
        } catch (err) {
        }
        return user;
    }
    var user;
    if (userInfoKey in req.query) {
        user = readUser(req.query[userInfoKey]);
        if (user) {
            res.cookie(userInfoKey, JSON.stringify(user), {
                maxAge : 900000,
            // secure : true
            });
        } else {
            res.clearCookie(userInfoKey);
        }
    } else {
        var cookies = req.cookies || {};
        user = readUser(cookies[userInfoKey]);
    }
    user = user || {};
    res.json(user);
});

app
        .get(
                '/api/twitter/last',
                function(req, res) {
                    res
                            .json({
                                "created_at" : "Tue Apr 14 12:10:35 +0000 2015",
                                "id" : 587951078118920200,
                                "id_str" : "587951078118920192",
                                "text" : "RT @w4software: http://t.co/BfNEKvSbqc Retrouvez-nous sur @TechOnMap ! #BPMN #Processus #Applications"
                            });
                });

/* ------------------------------------------------------- */
// / Fake save
var bodyParser = require('body-parser')
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended : true
}));
app.use('/api/resources/:id', function(req, res) {
    var obj = req.body;
    res.json(obj);
});

/* ------------------------------------------------------- */
var handlerProvider = new ServiceStubProvider(serviceOptions);
handlerProvider.registerInExpressApp(app);

/* ------------------------------------------------------- */
app.use('/data', express.static(__dirname + '/data'));
app.use(express.static(__dirname + '/app'));

// Start the server
app.listen(port);
console.log('http://localhost' + (port ? ':' + port : '') + '/');
