var _ = require('underscore');
var manifests = [ require('./default/manifest') ];
module.exports = function(app) {
    _.each(manifests, function(manifest) {
        var list = _.toArray(manifest);
        _.each(list, function(entry) {
            handleManifestEntry(app, entry);
        })
    });
}

function handleManifestEntry(app, entry) {
    var type = entry.type;
    _.each(entry.widgets, function(View, mode) {
        app.viewManager.registerView(mode, type, View);
    });
}
