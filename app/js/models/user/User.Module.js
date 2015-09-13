var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var App = require('mosaic-core').App;
var Api = App.Api;
var Teleport = require('mosaic-teleport');

/** This module manages resource statistics. */
module.exports = Api.extend({

    /**
     * Initializes internal fields.
     */
    _initFields : function() {
        this._user = null;
    },

    /**
     * Loads information about selected/active entities.
     */
    start : function() {
        return this.loadUserInfo();
    },

    /** Closes this module. */
    stop : function() {
    },

    _http : function(url, method) {
        method = method || 'GET';
        var client = Teleport.HttpClient.newInstance({
            baseUrl : url
        });
        return client.exec({
            path : '',
            method : method
        }).then(function(json) {
            try {
                return _.isObject(json) ? json : JSON.parse(json);
            } catch (err) {
                return;
            }
        });
    },

    logout : function() {
        var that = this;
        return this._http(this.app.options.logoutApiUrl).then(function(user) {
            that.notify();
            return user;
        });
    },

    loadUserInfo : function() {
        var that = this;
        return this._http(this.app.options.userInfoApiUrl).then(function(user) {
            if (JSON.stringify(user) != JSON.stringify(that._user)) {
                that._user = user;
                that.notify();
            }
            if (!user || !user.displayName)
                return;
            return user;
        });
    },
    
    getUserInfo : function() {
        if (!this._user || !this._user.displayName)
            return undefined;
        return this._user;
    }

});
