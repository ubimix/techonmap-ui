var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var App = require('mosaic-core').App;
var Teleport = require('mosaic-teleport');

var Api = App.Api;

/** Contact module. */
module.exports = Api.extend({}, {

    /** Initializes fields */
    _initFields : function() {
    },

    // ------------------------------------------------------------------

    /** Pre-loads map-related information. */
    start : function() {
        var that = this;
        var baseUrl = that.app.options.contactApiUrl;
        return Teleport.ApiDescriptor.HttpClientStub.load({
            baseUrl : baseUrl
        }).then(function(result) {
            that._api = result;
        });
    },

    stop : function() {
    },

    validateMessage : function(data) {
        var that = this;
        return Mosaic.P.then(function() {
            var errorMessage;
            var i18n = that.options.app.i18n;
            if (!data) {
                errorMessage = i18n.getMessage('contact.message.notDefined');
            } else if (that._isEmpty(data.name)) {
                errorMessage = i18n
                        .getMessage('contact.message.nameIsNotSpecified');
            } else if (that._isEmpty(data.email)
                    || data.email.indexOf('@') <= 0) {
                errorMessage = i18n
                        .getMessage('contact.message.emailIsNotSpecified');
            } else if (that._isEmpty(data.reason)) {
                errorMessage = i18n
                        .getMessage('contact.message.subjectIsNotSpecified');
            } else if (that._isEmpty(data.content)) {
                errorMessage = i18n
                        .getMessage('contact.message.contentIsNotSpecified');
            }
            if (errorMessage) {
                var error = new Error(errorMessage);
                error.message = errorMessage;
                throw error;
            }
            return data;
        });
    },

    sendMessage : function(message) {
        var that = this;
        return Mosaic.P.then(function() {
            return that._api.sendMail(message);
        });
    },

    _isEmpty : function(str) {
        if (!str || str === '')
            return true;
        str = str.replace(/^[\s\r\n]+|[\s\r\n]+$/gim, '');
        return str === '';
    }

});
