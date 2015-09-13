var revalidator = require('revalidator');
//var TemplatesLoader = require('mosaic-core').TemplatesLoader; 

var messages = {
    required : "Is required",
    allowEmpty : "must not be empty",
    minLength : "is too short (minimum is %{expected} characters)",
    maxLength : "is too long (maximum is %{expected} characters)",
    pattern : "invalid input",
    minimum : "must be greater than or equal to %{expected}",
    maximum : "must be less than or equal to %{expected}",
    exclusiveMinimum : "must be greater than %{expected}",
    exclusiveMaximum : "must be less than %{expected}",
    divisibleBy : "must be divisible by %{expected}",
    minItems : "must contain more than %{expected} items",
    maxItems : "must contain less than %{expected} items",
    uniqueItems : "must hold a unique set of values",
    format : "is not a valid %{expected}",
    conform : "must conform to given constraint",
    type : "must be of %{expected} type",
    additionalProperties : "must not exist",
    'enum' : "must be present in given enumerator"
};

var schema = {
    properties : {
        url : {
            description : 'the url the object should be stored at',
            type : 'string',
            format : 'url',
            // pattern : '^/[^#%&*{}\\:<>?\/+]+$',
            required : true,
            messages:  messages
        },
        challenge : {
            description : 'a means of protecting data (insufficient for production, used as example)',
            type : 'string',
            minLength : 5,
            messages:  messages
        },
        body : {
            description : 'what to store at the url',
            type : 'string',
            required : true,
            messages:  messages
        // 'default' : null,
        }
    }
};
var someObject = {
     url : 'http://www.foo.bar',
    challenge : 'abcd',
    body : ''
}
console.dir(revalidator.validate(someObject, schema));
