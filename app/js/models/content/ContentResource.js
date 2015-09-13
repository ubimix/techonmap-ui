var Mosaic = require('mosaic-commons');
var marked = require('marked');
var yaml = require('js-yaml/index.js');
var _ = require('underscore');

var ContentResource = Mosaic.Class.extend({
    initialize : function(options) {
        options = options || {};
        if (_.isString(options)) {
            options = ContentResource.parse(options);
        }
        this.setOptions(options);
    },

    set : function(field, value) {
        this.options[field] = value;
    },

    get : function(field) {
        return this.options[field];
    },

    getContent : function() {
        return this.get('content');
    },

    getContentAsHtml : function() {
        return this.getAsHtml('content');
    },

    getAsHtml : function(field) {
        var value = this.get(field);
        return ContentResource.formatAsHtml(value);
    }

});

ContentResource.formatAsHtml = function formatAsHtml(value) {
    if (!value)
        return '';
    if (_.isArray(value)) {
        return _.map(value, formatAsHtml);
    }
    if (_.isString(value)) {
        var html = marked(value);
        return html;
    }
    return value + '';
}

ContentResource.parse = function(str) {
    var array = str.split(/^---+/gim);
    var propsStr = null;
    var content = '';
    var props = {};
    if (array.length === 1) {
        content = array[0] || '';
        content = content.replace(/^[\s\r\n]+|[\s\r\n]+$/gim, '');
    } else {
        propsStr = array[0];
        array.splice(0, 1);
        content = array.join('\n----\n');
    }
    if (propsStr) {
        try {
            props = yaml.load(propsStr);
        } catch (e) {
            content = props + '\n----\n' + content;
        }
    }
    props.content = content;
    return props;
}

ContentResource.serialize = function(options) {
    options = options || {};
    var content = options.content;
    delete options.content;
    var serialized = yaml.safeDump(options);
    var result = '';
    if (serialized) {
        result = serialized + '\n----\n';
    }
    result += content;
    return result;
}

module.exports = ContentResource;