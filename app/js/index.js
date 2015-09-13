var MainApp = require('./MainApp');
var Config = require('./index.config');

var app = new MainApp(Config);
app.start().then(function() {
    console.log('App started.');
}, function(err) {
    console.log('Error!', err.stack);
});
