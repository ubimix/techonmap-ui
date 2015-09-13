var FormValidator = require('../app/js/views/utils/FormValidator');
var revalidator = require('revalidator');
var expect = require('expect.js');
var Mosaic = require('mosaic-commons');
var _ = require('underscore');

describe('Validator', function() {
    it('should validate a specified object againced a schema', function() {
        var validator = new FormValidator({
            schema : {
                properties : {
                    name : {
                        description : 'Votre nom',
                        type : 'string',
                        required : true
                    },
                    email : {
                        description : 'Votre adresse e-mail',
                        type : 'string',
                        format : 'email',
                        required : true
                    },
                    reason : {
                        description : 'Choisissez une raison',
                        type : 'string',
                        enum : [ 'technical', 'data', 'other' ],
                        required : true
                    },
                    content : {
                        description : 'Votre message',
                        type : 'string',
                        required : true
                    }
                }
            }
        });
        var obj = {};
        var result = validator.validate(obj);
        expect(result).to.eql({
            valid : false,
            errors : [ {
                attribute : 'required',
                property : 'name',
                expected : true,
                actual : undefined,
                message : 'Is required'
            }, {
                attribute : 'required',
                property : 'email',
                expected : true,
                actual : undefined,
                message : 'Is required'
            }, {
                attribute : 'required',
                property : 'reason',
                expected : true,
                actual : undefined,
                message : 'Is required'
            }, {
                attribute : 'required',
                property : 'content',
                expected : true,
                actual : undefined,
                message : 'Is required'
            } ]
        });

        obj.name = 'My message';
        result = validator.validate(obj);
        expect(result).to.eql({
            valid : false,
            errors : [ {
                attribute : 'required',
                property : 'email',
                expected : true,
                actual : undefined,
                message : 'Is required'
            }, {
                attribute : 'required',
                property : 'reason',
                expected : true,
                actual : undefined,
                message : 'Is required'
            }, {
                attribute : 'required',
                property : 'content',
                expected : true,
                actual : undefined,
                message : 'Is required'
            } ]
        });

        obj.email = 'foo.bar';
        result = validator.validate(obj);
        expect(result).to.eql({
            valid : false,
            errors : [ {
                attribute : 'format',
                property : 'email',
                expected : 'email',
                actual : 'foo.bar',
                message : 'Is not a valid email'
            }, {
                attribute : 'required',
                property : 'reason',
                expected : true,
                actual : undefined,
                message : 'Is required'
            }, {
                attribute : 'required',
                property : 'content',
                expected : true,
                actual : undefined,
                message : 'Is required'
            } ]
        });

        obj.email = 'foo.bar@test.com';
        result = validator.validate(obj);
        expect(result).to.eql({
            valid : false,
            errors : [ {
                attribute : 'required',
                property : 'reason',
                expected : true,
                actual : undefined,
                message : 'Is required'
            }, {
                attribute : 'required',
                property : 'content',
                expected : true,
                actual : undefined,
                message : 'Is required'
            } ]
        });

        obj.reason = 'technical1';
        result = validator.validate(obj);
        expect(result).to.eql({
            "valid" : false,
            "errors" : [ {
                "attribute" : "enum",
                "property" : "reason",
                "expected" : [ "technical", "data", "other" ],
                "actual" : "technical1",
                "message" : "Must be present in given enumerator"
            }, {
                "actual" : undefined,
                "attribute" : "required",
                "property" : "content",
                "expected" : true,
                "message" : "Is required"
            } ]
        });

        obj.reason = 'technical';
        result = validator.validate(obj);
        expect(result).to.eql({
            "valid" : false,
            "errors" : [ {
                "actual" : undefined,
                "attribute" : "required",
                "property" : "content",
                "expected" : true,
                "message" : "Is required"
            } ]
        });

    });
});
