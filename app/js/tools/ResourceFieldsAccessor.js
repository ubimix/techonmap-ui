var _ = require('underscore');
module.exports = {
    getValue : function(resource, field) {
        var result;
        var val = resource;
        if (!_.find(field.split('.'), function(segment) {
            if (!val)
                return true;
            val = val[segment];
            return false;
        })) {
            result = val;
        }
        return result;
    }
}
