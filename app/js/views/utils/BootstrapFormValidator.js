var Mosaic = require('mosaic-commons');
var _ = require('underscore');
var DomUtils = require('./DomUtils');
var FormValidator = require('./FormValidator');

var BootstrapFormValidator = FormValidator.extend(DomUtils, {

    reset : function() {
        var fields = this.getFields();
        _.each(fields, function(field) {
            field._visited = false;
        });
    },

    onViewUpdate : function() {
        var fields = this.getFields();
        _.each(fields, function(field) {
            field._visited = true;
        });
        return this._updateView({
            focus : true,
            checkHighlight : function(field) {
                return true;
            }
        });
    },

    onFieldUpdate : function(field) {
        if (_.isString(field)) {
            field = this.getField(field);
        }
        field._visited = true;
        return this._updateView({
            focus : false,
            checkHighlight : function(field) {
                return !!field._visited;
            }.bind(this)
        });
    },

    /**
     * @param options.focus
     *            if this method should focus the first element with errors
     * @param options.checkHighlight
     *            a method returning <code>true</code> if error messages for
     *            the specified field should be shown
     */
    _updateView : function(options) {
        var errClass = 'has-error';
        // Clean up existing messages
        var fields = this.getFields();
        _.each(fields, function(field) {
            var fieldElm = field.getDOMElement(0);
            var elm = this._getFormGroup(fieldElm);

            this._removeClass(elm, errClass);
            var alerts = elm.querySelectorAll('.alert');
            _.each(alerts, function(a) {
                a.parentNode.removeChild(a);
            });
        }, this);

        // Generate new messages
        var focused = false;
        var info = this.validate();
        if (info.result.valid)
            return info;
        _.each(info.result.errors, function(err) {
            var property = err.property;
            var field = this.getField(property);
            if (!field || //
            (options.checkHighlight && !options.checkHighlight(field)))
                return;
            var fieldElm = field.getDOMElement(0);
            var formGroup = this._getFormGroup(fieldElm);
            this._addClass(formGroup, errClass);
            if (!focused && options.focus) {
                fieldElm.focus();
                fieldElm.scrollIntoView(true);
                focused = true;
            }
            var div = document.createElement('div');
            this._addClass(div, 'alert alert-warning');
            div.innerHTML = err.message;
            fieldElm.parentNode.insertBefore(div, fieldElm.nextSibling)
        }, this);
        return info;
    },

    /**
     * Returns a "form-group" parent element for the specified input.
     * 
     * @param f
     *            a DOM input/textarea/select element
     */
    _getFormGroup : function(f) {
        var result;
        while (!result && f) {
            if (this._hasClass(f, 'form-group')) {
                result = f;
            }
            f = f.parentElement;
        }
        return result;
    },

});

module.exports = BootstrapFormValidator;
