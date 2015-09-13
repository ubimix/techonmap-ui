var _ = require('underscore');
module.exports = function(options) {
    var schema = newSchema(options);
    options = options || {};
    if (!options.newResource) {
        delete schema.properties.properties.properties.id;
        delete schema.properties.properties.properties.email;
    }
    return schema;
}

function newSchema(options) {
    function msg(key) {
        return options.getMessage(key);
    }
    return {
        properties : {
            'geometry' : {
                label : msg('field.geometry.coordinates'),
                type : 'object',
                required : true,
                properties : {
                    coordinates : {
                        label : msg('field.geometry.coordinates.label'),
                        description : msg('field.geometry.coordinates'),
                        type : 'array',
                        minItems : 2,
                        maxItems : 2,
                        required : true,
                        messages : {
                            minItems : msg('field.geometry.coordinates.required'),
                            maxItems : msg('field.geometry.coordinates.required'),
                            required : msg('field.geometry.coordinates.required')
                        },
                    },
                }
            },
            'properties' : {
                label : msg('field.properties'),
                type : 'object',
                required : true,
                messages : {
                    required : msg('field.properties.required'),
                },
                properties : {
                    name : {
                        label : msg('field.name'),
                        description : msg('field.name.description'),
                        type : 'string',
                        required : true,
                        messages : {
                            required : msg('field.name.required'),
                            allowEmpty : msg('field.name.allowEmpty')
                        }
                    },
                    id : {
                        label : msg('field.id'),
                        description : msg('field.id.description'),
                        type : 'string',
                        required : true,
                        messages : {
                            required : msg('field.id.required'),
                            allowEmpty : msg('field.id.allowEmpty'),
                            conform : msg('field.id.conform'),
                        },
                        conform : function(v) {
                            if (!v)
                                return false;
                            if (v.length < 3)
                                return false;
                            var ids = options.getAllIdentifiers() || {};
                            return !_.has(ids, v);
                        }
                    },
                    taxID : {
                        description : msg('field.taxID'),
                        type : 'string',
                        required : false,
                        messages : {
                            conform : msg('field.taxID.msg.conform'),
                        },
                        conform : function(v) {
                            if (!v || !v.length)
                                return true;
                            if (v.length != 14)
                                return false;
                            if (!v.match(/^\d+$/))
                                return false;
                            return true;

                            var result = checkLuhn(v);
                            return result;
                            function checkLuhn(imei) {
                                var digits = [ 0, 2, 4, 6, 8, 1, 3, 5, 7, 9 ];
                                var val = (imei.split('').reduce(function(sum,
                                        d, n) {
                                    return (n === (imei.length - 1) ? 0 : sum) + //
                                    parseInt((n % 2) ? d : digits[d]);
                                }, 0));
                                return (val % 10) == 0;
                            }
                        }
                    },
                    email : {
                        label : msg('field.email'),
                        description : msg('field.email.descripton'),
                        type : 'string',
                        format : 'email',
                        required : true,
                        messages : {
                            required : msg('field.email.required'),
                            allowEmpty : msg('field.email.allowEmpty'),
                            format : msg('field.email.msg.format'),
                        }
                    },
                    description : {
                        label : msg('field.description'),
                        description : msg('field.description.descripton'),
                        type : 'string',
                        maxLength : 250,
                        required : true,
                        messages : {
                            required : msg('field.description.required'),
                            allowEmpty : msg('field.description.allowEmpty'),
                            minLength : msg('field.description.minLength'),
                            maxLength : msg('field.description.maxLength')
                        }
                    },
                    category : {
                        label : msg('field.category'),
                        description : msg('field.category.description'),
                        type : 'string',
                        enum : options.getCategoryKeys(),
                        required : true
                    },
                    tags : {
                        label : msg('field.tags.label'),
                        description : msg('field.tags'),
                        minItems : 1,
                        maxItems : 5,
                        uniqueItems : true,
                        type : 'array',
                        required : true,
                        messages : {
                            minItems : msg('field.tags.minItems'),
                            required : msg('field.tags.required'),
                            allowEmpty : msg('field.tags.allowEmpty'),
                        }
                    },
                    address : {
                        label : msg('field.address'),
                        description : msg('field.address.description'),
                        type : 'string',
                        required : true,
                        messages : {
                            required : msg('field.address.msg.required'),
                            allowEmpty : msg('field.address.msg.allowEmtpy'),
                        }
                    },
                    postcode : {
                        label : msg('field.postcode'),
                        description : msg('field.postcode.description'),
                        type : 'integer',
                        allowEmpty : false,
                        required : true,
                        messages : {
                            required : msg('field.postcode.msg.required'),
                            allowEmpty : msg('field.postcode.msg.allowEmpty'),
                            conform : msg('field.postcode.msg.conform')
                        },
                        conform : function(v) {
                            try {
                                v = parseInt(v);
                                v += '';
                                var dept = v.substring(0, 2);
                                var idfDepts = ['75', '77', '78', '91', '92', '93', '94', '95'];
                                return v.length === 5 && idfDepts.indexOf(dept) >= 0;
                            } catch (e) {
                                return false;
                            }
                        }
                    },
                    city : {
                        label : msg('field.city'),
                        description : msg('field.city.description'),
                        type : 'string',
                        required : true,
                        messages : {
                            required : msg('field.city.msg.required'),
                            allowEmpty : msg('field.city.msg.allowEmpty')
                        }
                    },
                    url : {
                        label : msg('field.url'),
                        description : msg('field.url.description'),
                        type : 'string',
                        required : true,
                        pattern : /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})(:\d+)?\/?([\/\da-z\s\.-]+)*(\?.*)?$/i,
                        messages : {
                            required : msg('field.url.msg.required'),
                            allowEmpty : msg('field.url.msg.allowEmpty'),
                            format : msg('field.url.msg.format'),
                            pattern : msg('field.url.msg.format'),
                        }
                    },
                    creationyear : {
                        label : msg('field.creationyear'),
                        description : msg('field.creationyear.description'),
                        type : 'number',
                        required : true,
                        conform : function(v) {
                            try {
                                v = parseInt(v);
                                return v >= 1900
                                        && v <= new Date().getFullYear();
                            } catch (e) {
                                return false;
                            }
                        },
                        messages : {
                            conform : msg('field.messages'),
                            type : msg('field.messages.description'),
                        }
                    },
                    twitter : {
                        label : msg('field.twitter'),
                        description : msg('field.twitter.description'),
                        type : 'string',
                    },
                    facebook : {
                        label : msg('field.facebook'),
                        description : msg('field.facebook.description'),
                        type : 'string',
                        conform : function(v) {
                            return !!v
                                    && v
                                            .match(/^https?:\/\/([^\.]*)\.?facebook\.com\/.*$/g);
                        },
                        messages : {
                            conform : msg('field.facebook.msg.confirm')
                        }
                    },
                    googleplus : {
                        label : msg('field.googleplus'),
                        description : msg('field.googleplus.description'),
                        type : 'string',
                        required : false,
                        conform : function(v) {
                            return !!v
                                    && v
                                            .match(/^https?:\/\/plus\.google\.\w+\/.*$/g);
                        },
                        messages : {
                            conform : msg('field.googleplus.msg.conform'),
                        }
                    },
                    linkedin : {
                        label : msg('field.linkedin'),
                        description : msg('field.linkedin.description'),
                        type : 'string',
                        required : false,
                        conform : function(v) {
                            return !!v
                                    && v
                                            .match(/^https?:\/\/([^\.]*)\.?linkedin\.\w+\/.*$/g);
                        },
                        messages : {
                            conform : msg('field.linkedin.msg.conform'),
                        }
                    },
                    viadeo : {
                        label : msg('field.viadeo'),
                        description : msg('field.viadeo.description'),
                        type : 'string',
                        required : false,
                        conform : function(v) {
                            return !!v
                                    && v
                                            .match(/^https?:\/\/\w+\.viadeo\.\w+\/.*$/g);
                        },
                        messages : {
                            conform : msg('field.viadeo.msg.conform')
                        }
                    }
                }
            },
        }
    };
}
