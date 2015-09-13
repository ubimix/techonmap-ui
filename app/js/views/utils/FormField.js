var revalidator = require('revalidator');
var Mosaic = require('mosaic-commons');
var _ = require('underscore');

var FormField = Mosaic.Class.extend({
    initialize : function(options) {
        _.extend(this, options);
        this.inputs = this.inputs || [];
    },
    getValues : function() {
        var result = [];
        _.each(this.inputs, function(input) {
            var value = this._getInputValue(input);
            if (value){
                result.push(value);
            }
        }, this);
        return result;
    },
    setValues : function(values) {
        if (values == undefined) {
            values = [];
        } else if (!_.isArray(values)) {
            values = [ values ];
        }
        _.each(this.inputs, function(input, i) {
            var value = i < values.length ? values[i] : null;
            this._setInputValue(input, value, i);
        }, this);
    },
    getFieldName : function() {
        var name = this.name;
        if (!name) {
            name = this.inputs.length ? this.inputs[0].name : null;
        }
        return name || '';
    },
    getFieldNameSegments : function() {
        var name = this.getFieldName();
        return name ? name.split('.') : [];
    },

    getDOMElement : function(pos) {
        pos = pos || 0;
        var len = this.inputs ? this.inputs.length : 0;
        return pos >= 0 && pos < len ? this.inputs[pos] : null;
    },

    // -----------------------------------

    _getInputValue : function(input) {
        return input.value;
    },
    _setInputValue : function(input, value, pos) {
        input.value = value || '';
    },
});

// Static methods
_.extend(FormField, {

    extractFields : function(elm) {
        var that = this;
        function visit(e, fields) {
            that._addField(e, fields, e);
            var child = e.firstChild;
            while (child) {
                if (child.nodeType == 1) {
                    visit(child, fields);
                }
                child = child.nextSibling;
            }
        }
        var fields = {};
        visit(elm, fields);
        return this._newFieldsArray(fields);
    },

    _addField : function(e, fields, field) {
        var name = e.nodeName;
        if (!name)
            return;
        name = name.toLowerCase();
        var path;
        var val;
        if ((name == 'input') || (name == 'textarea') || //
        (name == 'select')) {
            path = e.getAttribute('name');
        }
        if (path) {
            var array = fields[path] = fields[path] || [];
            array.push(field);
        }
    },

    _newFieldsArray : function(fields) {
        var FieldType = this;
        return _.map(fields, function(inputs, name) {
            return new FieldType({
                name : name,
                inputs : inputs
            });
        });
    }

});

module.exports = FormField;
