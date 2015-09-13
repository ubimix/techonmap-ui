'use strict';
var _ = require('underscore');
module.exports = {
    /**
     * Returns a lablel corresponding to the panel with the specified identifier
     */
    _getLabel : function(labelKey) {
        var app = this.getApp();
        var i18n = app.i18n;
        return i18n.getMessage.apply(i18n, arguments);
    },
};
