/** @jsx React.DOM */
var _ = require('underscore');
var React = require('react');
var I18NMixin = require('../../utils/I18NMixin');

module.exports = React.createClass({
    displayName : 'ListItemEmpty.Default',
    mixins: [ I18NMixin ],
  
    getApp : function(){
        return this.props.app;
    },
    
    render: function() {
        var app = this.getApp();
        return (
            <div className="media list-group-item empty">
                <div className="media-body">
                    <div className="media-heading">
                        <h4>{this._getLabel('list.msg.empty')}</h4>
                    </div>
                </div>
            </div>
        );
    },
});
 