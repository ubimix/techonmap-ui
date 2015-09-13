var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var revalidator = require('revalidator');
var ResourceUtils = require('../../tools/ResourceUtilsMixin');
var App = require('mosaic-core').App;
var Api = App.Api;
var HttpClient = require('mosaic-teleport').HttpClient;
var newSchema = require('./EntityEditFormSchema');

/** This module manages resource editing process. */
module.exports = Api.extend(ResourceUtils, {

    /**
     * Initializes internal fields.
     */
    _initFields : function() {
        this._changedResourceFields = {};
    },

    /**
     * Loads information about selected/active entities.
     */
    start : function() {
    },

    /** Closes this module. */
    stop : function() {
    },

    isEditing : function() {
        return !!this._resource;
    },

    startEdit : Api.intent(function(intent) {
        var that = this;
        return intent.resolve(Mosaic.P.then(function() {
            that._original = intent.params.resource;
            that._doReset();
        })).then(function() {
            that.notify();
        });
    }),

    getResource : function() {
        return this._resource;
    },

    getResourceValue : function(name) {
        name = name || '';
        var segments = name.split('.');
        var len = segments ? segments.length : 0;
        var obj = this._resource;
        var i;
        var segment;
        for (i = 0; obj && i < len; i++) {
            segment = segments[i];
            obj = obj[segment];
        }
        return obj;
    },

    reset : Api.intent(function(intent) {
        var that = this;
        var update = false;
        return intent.resolve(Mosaic.P.then(function() {
            if (that.isEditing() && that._isChanged()) {
                update = true;
                that._doReset();
            }
        })).then(function() {
            if (update) {
                that.notify();
            }
        });
    }),

    save : function() {
        return this.endEdit({
            save : true
        });
    },

    cancel : function() {
        return this.endEdit({
            save : false
        });
    },

    endEdit : Api.intent(function(intent) {
        var that = this;
        var notify = false;
        return intent.resolve(Mosaic.P.then(function() {
            notify = that.isEditing();
            if (!notify)
                return;
            var resource = that._resource;
            delete that._original;
            delete that._resource;
            delete that._changedResourceFields;
            delete that._validationResults;
            if (intent.params.save) {
                return that._saveResource(resource);
            }
        })).then(function(resource) {
            if (notify) {
                that.notify();
            }
            that._notifyEndEdit({
                changed : notify,
                resource : resource
            });
        });
    }),

    updateFields : Api.intent(function(intent) {
        var that = this;
        var notify = false;
        return intent.resolve(Mosaic.P.then(function() {
            if (!that.isEditing())
                return;
            that._changedResourceFields = {};
            var resource = that._clone(that._resource);
            _.each(intent.params, function(values, name) {
                that._changedResourceFields[name] = true;
                notify |= that._setResourceFieldValue(resource, name, values);
                notify = true;
            });
            if (notify) {
                that._checkIdField(resource);
                that._checkTaxIdField(resource);
                that._checkYearField(resource);
                console.log('updateFields: ', JSON.stringify(this._resource, null, 2),  JSON.stringify(resource, null, 2))
                that._resource = resource;
                that._validateResource();
            }
        })).then(function() {
            if (notify) {
                that.notify();
            }
        });
    }),

    isNewResource : function() {
        if (!this._original)
            return;
        var props = this._original.properties || {};
        return !props.id;
    },

    isValid : function() {
        if (!this._validationResults)
            return undefined;
        return this._validationResults.valid;
    },

    getFieldError : function(name) {
        if (!this._validationResults)
            return undefined;
        if (!_.has(this._changedResourceFields, name))
            return null;
        var error = this._validationResults.errorIndex[name];
        return error ? error.message : null;
    },

    getValidationResults : function() {
        return this._validationResults;
    },

    validateResource : Api.intent(function(intent) {
        var that = this;
        return intent.resolve(Mosaic.P.then(function() {
            if (!that.isEditing())
                return null;
            that._validateResource();

            _.each(that._validationResults.errors, function(err) {
                var name = err.property;
                that._changedResourceFields[name] = true;
            }, this);

            return that._validationResults;
        })).then(function() {
            that.notify();
        });
    }),

    _notifyEndEdit : function(saved) {
        this.emit('save:end', saved);
    },

    addEndEditListener : function(listener, context) {
        this.on('save:end', listener, context);
    },

    removeEndEditListener : function(listener, context) {
        this.off('save:end', listener, context);
    },

    _checkIdField : function(resource) {
        if (!this.isNewResource())
            return;
        var prevProps = this._resource.properties || {};
        var prevId = prevProps.id;
        var prevName = prevProps.name;
        var properties = resource.properties = resource.properties || {};
        var name = properties.name;
        if (true && //
        !_.has(this._changedResourceFields, 'properties.id') && //
        (!prevId || prevId == this._normalizeName(prevName))) {
            properties.id = name;
        }
        properties.id = this._normalizeName(properties.id);
        if (name !== prevName) {
            this._changedResourceFields['properties.id'] = true;
            // delete this._changedResourceFields['properties.id'];
        }
    },
    _checkYearField : function(resource) {
        var properties = resource.properties = resource.properties || {};
        var creationyear = (properties.creationyear || '') + '';
        var prevCreationyear = creationyear;
        creationyear = properties.creationyear = //
        creationyear.replace(/[^\d]+/gim, '');
        if (creationyear !== prevCreationyear) {
            this._changedResourceFields['properties.creationyear'] = true;
        }
    },
    _checkTaxIdField : function(resource) {
        var properties = resource.properties = resource.properties || {};
        var taxID = properties.taxID || '';
        var prevID = taxID;
        taxID = properties.taxID = taxID.replace(/[^\d]+/gim, '');
        if (taxID !== prevID) {
            this._changedResourceFields['properties.taxID'] = true;
        }
    },

    getCardinality : function(name) {
        var segments = name.split('.');
        var result = [ 0, 0 ];
        var fieldSchema = this._getFieldSchema(segments);
        if (fieldSchema) {
            result[1] = 1;
            if (fieldSchema.required) {
                result[0] = 1;
            }
            if (fieldSchema.type == 'array') {
                if (fieldSchema.minItems !== undefined) {
                    result[0] = +fieldSchema.minItems;
                }
                if (fieldSchema.maxItems !== undefined) {
                    result[1] = +fieldSchema.maxItems;
                }
            }
        }
        return result;
    },

    _normalizeName : ResourceUtils.normalizeName,

    _doReset : function() {
        this._resource = this._clone(this._original);
        if (!this._resource.properties) {
            this._resource.properties = {};
        }
        if (!this._resource.geometry) {
            this._resource.geometry = {
                type : 'Point',
                coordinates : undefined // [ 0, 0 ]
            }
        }
        this._changedResourceFields = {};
        this._validateResource();
    },

    _validateResource : function() {
        var schema = this.getSchema();
        this._validationResults = revalidator.validate(this._resource, schema,
                {
                    cast : true
                });
        this._validationResults.errorIndex = {};
        _.each(this._validationResults.errors, function(err) {
            var property = err.property;
            this._validationResults.errorIndex[property] = err;
        }, this);
        return this._validationResults;
    },

    _setResourceFieldValue : function(resource, name, values) {
        var segments = name.split('.');
        var len = segments ? segments.length : 0;
        var obj = resource;
        var i;
        var segment;
        var nextSegment = segments[0];
        for (i = 1; i < len; i++) {
            segment = nextSegment;
            nextSegment = segments[i];
            var child = obj[segment];
            if (!child) {
                if (nextSegment.match(/^\d+$/)) {
                    child = [];
                } else {
                    child = {};
                }
                obj[segment] = child;
            }
            obj = child;
        }
        segment = nextSegment;

        var fieldSchema = this._getFieldSchema(segments);
        var type = fieldSchema ? fieldSchema.type : undefined;
        var val = (type == 'array' || values.length > 1) ? values : values[0];
        if (!val) {
            delete obj[segment];
        } else {
            obj[segment] = val;
        }
        return true;
    },

    _getFieldSchema : function(segments) {
        var schema = this.getSchema();
        var len = segments ? segments.length : 0;
        var i;
        for (i = 0; schema && i < len; i++) {
            var segment = segments[i];
            var props = schema.properties || {};
            schema = props[segment];
        }
        return schema;
    },

    getSchema : function() {
        var that = this;
        var field = '_existingResourceShema';
        var newResource = that.isNewResource();
        if (newResource) {
            field = '_newResourceSchema';
        }
        return getSchema(field, {
            newResource : newResource
        });
        function getSchema(field, options) {
            if (!that[field]) {
                // Overload the default messages
                that[field] = that._newSchema(options);
                var messages = that._getSchemaValidationMessages();
                visitSchema(that[field], function(prop, key) {
                    prop.messages = _.extend({}, messages, prop.messages);
                });
            }
            return that[field];
        }
        function visitSchema(schema, callback) {
            _.each(schema.properties, function(prop, key) {
                callback.call(this, prop, key);
                visitSchema(prop, callback);
            }, this);
        }
    },

    _newSchema : function(options) {
        var app = this.options.app;
        options = _.extend({}, options, {
            getAllIdentifiers : function() {
                return app.res.getAllResourceIndex();
            },
            getMessage : function(key) {
                var i18n = app.i18n;
                return i18n.getValidationMessage.apply(i18n, arguments);
            },
            getCategoryKeys : function(key) {
                // FIXME:
                return app.res.getCategoryKeys();
            }
        });
        return newSchema(options);
        function copy(from) {
            var to = {};
            _.each(from, function(val, key) {
                if (_.isObject(val)) {
                    val = copy(val);
                }
                to[key] = val;
            });
            return to;
        }
    },
    _getSchemaValidationMessages : function() {
        var app = this.options.app;
        return app.i18n.getFormValidationMessages();
    },

    _clone : function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    _isChanged : function() {
        var resource = this._resource;
        return JSON.stringify(resource) !== JSON.stringify(this._original);
    },

    _saveResource : function(resource) {
        var app = this.options.app;
        var baseUrl = app.options.contentSaveUrl;
        var id = this.getResourceId(resource);
        var path = id ? id : '';
        var client = HttpClient.newInstance({
            baseUrl : baseUrl
        });
        return client.exec({
            method : 'PUT',
            path : path,
            body : resource,
            headers : {
            // 'Content-Type' : 'application/json; charset=utf-8'
            }
        }).then(function(result) {
            return result;
        }, function(err) {
            throw err;
        });
    },

});
