/** @jsx React.DOM */
var _ = require('underscore');
var React = require('react');

var FullscreenLayout = require('./FullscreenLayout.jsx');
var MobileLayout = require('./MobileLayout.jsx');
 
module.exports = React.createClass({
    displayName : 'MainView',
    getInitialState : function(){
        return this._newState();
    },
    componentWillMount : function(){
        var app = this.props.app;
        app.ui.addChangeListener(this._updateVisualizationMode);
    },
    componentWillUnmount : function(){
        var app = this.props.app;
        app.ui.removeChangeListener(this._updateVisualizationMode);
    },
    _updateVisualizationMode : function(){
        this.setState(this._newState());
    },
    _newState : function(options){
        return _.extend({
        }, this.state, options);
    },
    _mobileLayout : function(){
        return <MobileLayout app={this.props.app}/>
    },
    _fullscreenLayout : function(){
        return <FullscreenLayout app={this.props.app}/>
    },
    render : function() {
        var app = this.props.app;
        var mobileMode = app.ui.isMobileMode();
        if (mobileMode) {
            return this._mobileLayout();
        } else {
            return this._fullscreenLayout();
        }
    }
});
