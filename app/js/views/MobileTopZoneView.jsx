/** @jsx React.DOM */

var _ = require('underscore');
var React = require('react');
var DomUtils = require('./utils/DomUtils');
var I18NMixin = require('./utils/I18NMixin');
var ViewActivationMixin = require('./utils/ViewActivationMixin');
var ContentPopupMixin = require('./utils/ContentPopupMixin');
var SearchPanel = require('./search/SearchPanel.jsx');
var SharePopup = require('./dialogs/SharePopup.jsx');
var ExportPopup = require('./dialogs/ExportPopup.jsx');
var PopupPanel = require('mosaic-core').React.PopupPanel;

module.exports = React.createClass({
    displayName : 'MobileTopZoneView',
    mixins : [ DomUtils, I18NMixin, ContentPopupMixin, ViewActivationMixin ],
    getApp : function(){
        return this.props.app;
    },
    componentDidMount : function(){
    },
    componentWillUnmount : function(){
    },
    getInitialState : function(){
        return this._newState();
    },
    _newState : function(options){
        return _.extend({ showSearchMenu : false }, this.state, options);
    },

    _showAboutInfo : function(ev) {
        var app = this.props.app;
        app.ui.focusView('about');
        ev.preventDefault();
        ev.stopPropagation();
    },
    _renderAboutMenuItem : function(){
        var className = this._getClassName('about');
        className += ' li-info';
        return (
            <li className={className}>
                <a href="#" className="menu-info" onClick={this._showAboutInfo}>
                    <i className="icon icon-info"></i>
                </a>
            </li>
        );
    },

    _getClassName : function(key) {
        var app = this.props.app;
        var activeKey = app.ui.getFocusedViewKey();
        return key === activeKey ? 'active' : '';
    },

    _renderSearchMenuItem : function(){
        var className = this._getClassName('search');
        className += ' li-search';
        return (
            <li className={className}>
                <a href="#" className="menu-search icon"
                    onClick={this._activateView.bind(this, 'search')}>
                    <i className="icon icon-search-mobile"></i>
                </a>
            </li>
        );
    },

    _renderMapMenuItem: function(){
        var className = this._getClassName('map');
        className += ' li-map';
        return (
            <li className={className}>
                <a href="#" className="menu-map"
                        onClick={this._activateView.bind(this, 'map')}>
                    <i className="icon icon-map"></i>
                </a>
            </li>
        );
    },

    _activateListView : function(ev){
        var app = this.props.app;
        app.ui.focusView('list');
        ev.preventDefault();
        ev.stopPropagation();
    },
    _renderListMenuItem: function(){
        var className = this._getClassName('list');
        className += ' li-list';
        return (
            <li className={className}>
                <a href="#" className="menu-list" onClick={this._activateListView}>
                    <i className="icon icon-list"></i>
                </a>
            </li>
        );
    },
    render : function() {
        var app = this.props.app;
        var className = this.props.className + " navbar navbar-default";
        return (
            <nav className={className} role="navigation">
              <div className="container-fluid">
                  <div className="row">
                      <div className="col-xs-4">
                          <div className="navbar-header">
                              <a className="navbar-brand" href="http://www.techonmap.fr">
                                  <img src="images/logo-01.svg" />
                              </a>
                          </div>
                      </div>
                      <div className="col-xs-8">
                          <ul className="nav nav-tabs pull-right top-navigation mobile">
                              {this._renderAboutMenuItem()}
                              {this._renderSearchMenuItem()}
                              {this._renderMapMenuItem()}
                              {this._renderListMenuItem()}
                          </ul>
                      </div>
                  </div>
              </div>
          </nav>
        );
    }
});
