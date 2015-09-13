var revalidator = require('revalidator');
var Mosaic = require('mosaic-commons');
var _ = require('underscore');
var FormField = require('./FormField');

var FormReactField = FormField.extend({
    getFieldName : function() {
        var name = this.name;
        if (!name) {
            name = this.inputs.length ? this.inputs[0].props.name : null;
        }
        return name || '';
    },
    getDOMElement : function(pos) {
        pos = pos || 0;
        var len = this.inputs ? this.inputs.length : 0;
        var input = pos >= 0 && pos < len ? this.inputs[pos] : null;
        var result = input && input.isMounted() ? input.getDOMNode() : null;
        return result;
    },
    _getInputValue : function(input) {
        var elm = input.getDOMNode();
        var result = elm.value || undefined;
        return result;
    },
    _setInputValue : function(input, value, pos) {
        input.setProps({
            value : value || ''
        });
    },
});

// Static methods
_.extend(FormReactField, {
    extractFields : function(component) {
        var fields = {};
        _.each(component.refs, function(child) {
            if (!child.isMounted())
                return;
            var e = child.getDOMNode();
            this._addField(e, fields, child);
        }, this);
        return this._newFieldsArray(fields);
    }
});

module.exports = FormReactField;
