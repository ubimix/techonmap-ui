/** @jsx React.DOM */
var _ = require('underscore');
var React = require('react');

var ViewActivationMixin = {
    _activateView : function(key, ev) {
        var app = this.props.app;
        app.ui.focusView(key);
        if (ev) {
            ev.preventDefault();
            ev.stopPropagation();
        }
    }
};

module.exports = ViewActivationMixin;
