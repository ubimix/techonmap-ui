/** @jsx React.DOM */
var _= require('underscore');
var React = require('react');
var ListItemMixin = require('../ListItemMixin.jsx');
var ResourceUtils = require('../../../tools/ResourceUtilsMixin');
var ViewActivationMixin = require('../../utils/ViewActivationMixin');

module.exports = React.createClass({
    displayName : 'MapPopup.Default',
    mixins: [ListItemMixin, ViewActivationMixin],
    _getResourceType : function(){
        var app = this.getApp();
        return app.res.getResourceType(this.props.resource);
    },
    _getResourceId : function(){
        var app = this.getApp();
        return app.res.getResourceId(this.props.resource);
    },
    _onClick : function(ev){
        var that = this;
        var app = that.getApp();
        var id = that._getResourceId();
        app.res.selectResource({
            resourceId : id
        }).then(function(){
            app.ui.focusView('list');
        });        
        ev.preventDefault();
        ev.stopPropagation();
    },
    render: function() {
        var resourceId = this._getResourceId();
        var resourceType = this._getResourceType();
        return (
            <div key={resourceId}>
                <a href="#" onClick={this._onClick}>
                    {this._renderName()}
                </a>
                <div>{this._renderTags(true)}</div>
                {this._renderAddress()}
                {this._renderSocialNetworks()}
            </div>
        );            
    },
});
 