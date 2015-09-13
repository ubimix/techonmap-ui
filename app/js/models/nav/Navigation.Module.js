var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var ResourceUtils = require('../../tools/ResourceUtilsMixin');
var URL = require('url');
var App = require('mosaic-core').App;
var Api = App.Api;
var AppStateMixin = require('../AppStateMixin');

/** Navigation module. Manages search criteria applied to resources. */
module.exports = Api.extend({}, ResourceUtils, AppStateMixin, {

    /** Initializes fields */
    _initFields : function() {
    },

    // ------------------------------------------------------------------

    /** Pre-loads map-related information. */
    start : function() {
        this._notifyPathChanges = this._notifyPathChanges.bind(this);
        window.addEventListener('popstate', this._notifyPathChanges, this);
        var appState = this.getAppState();
        appState.addChangeListener(this._onStateChange, this);
        var that = this;
        return Mosaic.P.then(function() {
            return that._copyStateFromUrl();
        });
    },

    stop : function() {
        var appState = this.getAppState();
        appState.removeChangeListener(this._onStateChange, this);
        window.removeEventListener('popstate', this._notifyPathChanges, this);
    },

    // ------------------------------------------------------------------
    // URL management methods

    _getExportUrl : function(options) {
        options = options || {};
        var additionalParams = {};
        var appState = this.getAppState();
        var clone = appState.clone();
        _.extend(clone.options, options);
        function fromStateToUrl(from, to, mapping) {
            _.each(mapping, function(path, key) {
                var val = from.getValue(path);
                if (val !== '' && val !== undefined && val !== null) {
                    to[key] = val;
                }
            })
        }
        var url = {
            query : {},
            path : '',
        };
        fromStateToUrl(clone, url, {
            hash : 'selectedId'
        });
        fromStateToUrl(clone, url.query, {
            language : 'language',
            category : 'search.category',
            tags : 'search.tags',
            postcode : 'search.postcode',
            q : 'search.q',
            mode : 'mode',
            header : 'header'
        });
        if (url.query.mode == 'full') {
            delete url.query.mode;
        }
        return url;
    },

    getExportUrl : function(options) {
        var url = this._getExportUrl(options);
        return URL.format(url);
    },

    _onStateChange : function() {
        var url = this._getExportUrl();
        var formattedUrl = URL.format(url);
        if (!formattedUrl) {
            formattedUrl = '/';
        } else if (formattedUrl[0] !== '/') {
            formattedUrl = '/' + formattedUrl;
        }
        if (window.history) {
            window.history.replaceState(url, formattedUrl, formattedUrl);
        }
    },

    _notifyPathChanges : function(ev) {
        var path = this._getCurrentUrl();
        // console.log('* PATH CHANGED', path, ev);
    },

    _copyStateFromUrl : function() {
        var appState = this.getAppState();
        var url = this._getCurrentUrl();
        function fromUrlToState(from, to, mapping) {
            _.each(mapping, function(path, key) {
                var val = from[key];
                if (key === 'hash' && val && val.length > 1) {
                    val = val.substring(1);
                }
                to.setValue(path, val);
            })
        }
        fromUrlToState(url.query, appState, {
            language : 'language',
            category : 'search.category',
            tags : 'search.tags',
            postcode : 'search.postcode',
            q : 'search.q',
            mode : 'mode',
            header : 'header'
        });
        fromUrlToState(url, appState, {
            hash : 'selectedId'
        });
    },

    /** Returns the current URL. */
    _getCurrentUrl : function() {
        var href = window.location.href + '';
        var url = URL.parse(href, true);
        return url;
    },

    _getBaseUrlFormatted : function() {
        var url = this._getBaseUrl();
        var newUrl = {
            auth : url.auth,
            hash : url.hash,
            host : url.host,
            hostname : url.hostname,
            pathname : url.pathname || '/',
            port : url.port,
            protocol : url.protocol
        };
        return URL.format(newUrl);
    },
    /** Returns the base URL. */
    _getBaseUrl : function() {
        if (!this._baseUrl) {
            var url = this._getCurrentUrl();
            var basePath = URL.parse(this.options.baseUrl || '', true);
            var baseUrl = URL.resolve(url + '', basePath + '');
            this._baseUrl = baseUrl;
        }
        return this._baseUrl;
    },

});
