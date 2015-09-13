/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
module.exports = {
    _formatAddr : function(props) {
        var cityInfo = [ props.postcode, props.city ];
        cityInfo = _.filter(cityInfo, notEmpty);
        cityInfo = cityInfo.length ? cityInfo.join(' ') : undefined;
        var arr = [ props.address, cityInfo ];
        arr = _.filter(arr, notEmpty);
        return arr.length ? arr.join(', ') : undefined;
    },
    _formatTel : function(str, prefix) {
        str = this._normalizeTel(str);
        if (isEmpty(str))
            return undefined;
        return [ prefix, str ];
    },
    _formatRef : function(href, options) {
        options = options || {};
        var label = options.label || href;
        if (!href)
            return undefined;
        return React.DOM.a(_.extend({}, options, {
            href : href
        }), label);
    },
    _formatUrl : function(href) {
        var url = href || '';
        if (url.indexOf('http') != 0)
            url = 'http://' + url;
        var urlLabel = url;
        if (urlLabel) {
            urlLabel = urlLabel.replace(/^https?:\/\//, '');
        }
        var maxLength = 25;
        if (urlLabel.length > maxLength + 3)
            urlLabel = urlLabel.substring(0, maxLength) + '...';
        return {
            url : url,
            label : urlLabel
        };
    },
    _wrap : function(val, prefix, suffix) {
        if (!val)
            return undefined;
        return _.filter([ prefix, val, suffix ], notEmpty);
    },
    _normalizeTel : function(str) {
        if (isEmpty(str))
            return undefined;
        str = str.replace(/^[\s\r\n ]+|[\s\r\n ]+$/gim, '');
        str = str.replace(/[\s\r\n ]+/gim, '.');
        return str;
    },
    _linkifyTwitterStatus : function(text) {
        text = text.replace(/(https?:\/\/\S+)/gi, function(s) {
            return '<a href="' + s + '">' + s + '</a>';
        });
        text = text.replace(/(^|)@(\w+)/gi, function(s) {
            return '<a href="https://twitter.com/' + s + '">' + s + '</a>';
        });
        text = text.replace(/(^|)#(\w+)/gi, function(s) {
            return '<a href="https://twitter.com/search?q=' + s.replace(/#/, '%23') + '">' + s + '</a>';
        });
        return text;
    },
    _parseTwitterDate : function(stamp) {
        var date = new Date(Date.parse(stamp));
        var day = date.getDate();
        var month = date.getMonth();
        var year = date.getFullYear();
        return day + '/' + (month + 1) + '/' + year;
    }
};

function isEmpty(s) {
    return !s || s.length === undefined || !s.length;
}
function notEmpty(s) {
    return s && (s.length === undefined || s.length);
}
