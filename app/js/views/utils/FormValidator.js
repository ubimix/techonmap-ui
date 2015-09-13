var revalidator = require('revalidator');
var Mosaic = require('mosaic-commons');
var _ = require('underscore');

/**
 * This class expects two parameters:
 * 
 * @param schema
 *            a JSON Schema defining validation rules for the form
 * @param fields
 *            an array of FormField instances giving access to individual form
 *            fields
 */
var FormValidator = Mosaic.Class.extend({

    initialize : function(options) {
        this.setOptions(options);
        this.setFields(options.fields);
    },

    setFields : function(fields) {
        this._fieldsIndex = {};
        this._fields = fields || [];
        _.each(fields, function(field) {
            var name = field.getFieldName();
            this._fieldsIndex[name] = field;
        }, this);
    },

    getFields : function() {
        return this._fields;
    },

    getData : function() {
        var data = {};
        var fields = this.getFields();
        var schema = this.getSchema();
        _.each(fields, function(field, pos) {
            var values = field.getValues();
            if (values.length) {
                var segments = field.getFieldNameSegments();
                var len = segments ? segments.length : 0;
                var obj = data;
                var i;
                var segment;
                for (i = 0; i < len - 1; i++) {
                    segment = segments[i];
                    obj = obj[segment] = obj[segment] || {};
                }
                segment = segments[i];
                var fieldSchema = this._getFieldSchema(schema, segments);
                var type = fieldSchema ? fieldSchema.type : undefined;
                obj[segment] = //
                type == 'array' || values.length > 1 ? values : values[0];
            }
        }, this);
        return data;
    },

    setData : function(data) {
        function visit(obj, stack) {
            _.each(obj, function(value, prop) {
                stack.push(prop);
                if (_.isObject(value)) {
                    visit(value, stack);
                } else {
                    var path = stack.join('.');
                    var field = this._fieldsIndex[name];
                    if (field) {
                        field.setValues(value);
                    }
                }
                stack.pop();
            });
        }
        visit(data, []);
    },

    validate : function() {
        var obj = this.getData();
        var schema = this.getSchema();
        var result = revalidator.validate(obj, schema, {
            cast : true
        });
        return {
            data : obj,
            result : result
        };
    },

    getSchema : function() {
        if (!this._schema) {
            this._schema = this.options.schema || {};
            function visitSchema(schema, callback) {
                _.each(schema.properties, function(prop, key) {
                    callback.call(this, prop, key);
                    visitSchema(prop, callback);
                }, this);
            }
            // Overload the default messages
            var messages = this._getMessages();
            visitSchema(this._schema, function(prop, key) {
                prop.messages = _.extend({}, messages, prop.messages);
            });
        }
        return this._schema;
    },

    getFieldSchema : function(field) {
        if (_.isString(field)) {
            field = this.getField(field);
        }
        var schema = this.getSchema();
        var segments = field ? field.getFieldNameSegments() : [];
        return this._getFieldSchema(schema, segments);
    },

    _getFieldSchema : function(schema, segments) {
        var len = segments ? segments.length : 0;
        var i;
        for (i = 0; schema && i < len; i++) {
            var segment = segments[i];
            var props = schema.properties || {};
            schema = props[segment];
        }
        return schema;
    },

    getField : function(name) {
        return this._fieldsIndex[name];
    },

    _getMessages : function() {
        if (_.isObject(this.options.messages))
            return this.options.messages;
        return {
            required : "Is required",
            allowEmpty : "Must not be empty",
            minLength : "Is too short (minimum is %{expected} characters)",
            maxLength : "Is too long (maximum is %{expected} characters)",
            pattern : "Invalid input",
            minimum : "Must be greater than or equal to %{expected}",
            maximum : "Must be less than or equal to %{expected}",
            exclusiveMinimum : "Must be greater than %{expected}",
            exclusiveMaximum : "Must be less than %{expected}",
            divisibleBy : "Must be divisible by %{expected}",
            minItems : "Must contain more than %{expected} items",
            maxItems : "Must contain less than %{expected} items",
            uniqueItems : "Must hold a unique set of values",
            format : "Is not a valid %{expected}",
            conform : "Must conform to given constraint",
            type : "Must be of %{expected} type",
            additionalProperties : "Must not exist",
            'enum' : "Must be present in given enumerator"
        };
    },

});

module.exports = FormValidator;
