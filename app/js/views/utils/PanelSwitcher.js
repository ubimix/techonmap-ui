var React = require('react');
var _ = require('underscore');
var PanelSwitcher = React.createClass({
    displayName : 'PanelSwitcher',
    getInitialState : function() {
        return this._newState();
    },
    activate : function(key) {
        this.setState(this._newState({
            active : key
        }));
    },
    _newState : function(options) {
        var state = _.extend({
            active : this.props.active
        }, this.state, options);
        return state;
    },
    render : function() {
        var active = this.state.active;
        var panels = [];
        React.Children.forEach(this.props.children, function(child) {
            if (child.ref === active) {
                panels.push(child);
            }
        });
        return React.DOM.div(this.props, panels);
    },
});
module.exports = PanelSwitcher;