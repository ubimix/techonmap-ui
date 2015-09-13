/** @jsx React.DOM */
var _ = require('underscore');
var React = require('react');
var AppViewMixin = require('./AppViewMixin');
var SearchInfoBlock = require('./search/SearchInfoBlock.jsx');
var DomUtils= require('./utils/DomUtils');
var I18NMixin = require('./utils/I18NMixin');

module.exports = React.createClass({

    displayName : 'LeftToolbar',

    mixins : [ I18NMixin, AppViewMixin ],

    _getStore : function(){
        return this.props.app.res;
    },
    
    _newState : function(){
        return { };
    },
    
    _incZoomLevel : function(ev){
        var app = this.props.app;
        app.map.changeMapZoom({ zoomDelta : +1 });
        ev.stopPropagation();
        ev.preventDefault();
    },

    _decZoomLevel : function(ev){
        var app = this.props.app;
        app.map.changeMapZoom({ zoomDelta : -1 });
        ev.stopPropagation();
        ev.preventDefault();
    },
    
    _renderZoomButtons : function(){
        if (this.props.hideZoom)
            return '';
        return (
            <div className="btn-group-vertical map-control" role="group">
                <button type="button" className="btn btn-default"
                    onClick={this._incZoomLevel}>
                    <i className="icon-zoom-in"></i>
                </button>
                <button type="button" className="btn btn-default"
                    onClick={this._decZoomLevel}>
                    <i className="icon-zoom-out"></i>
                </button>
            </div>  
        );
    },

    render : function() {
        var app = this.props.app;
        return (
            <div className={this.props.className}>
                <SearchInfoBlock app={app}  className="info-blocks" />
                {this._renderZoomButtons()}
            </div>
        );
    }
});
