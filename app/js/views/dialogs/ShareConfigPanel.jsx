/**
 * @jsx React.DOM
 */
'use strict';
var _ = require('underscore');
var React = require('react');
var Mosaic = require('mosaic-commons');
var DomUtils = require('../utils/DomUtils');
var I18NMixin = require('../utils/I18NMixin');
var ExportTypeSelector = require('./ExportTypeSelector.jsx');

var ShareConfigPanel = React.createClass({
    displayName: "ShareConfigPanel",
    mixins : [I18NMixin],
    componentWillMount : function(){
        this.props.events.on('preview', this._showPreview, this);
    },
    componentWillUnmount : function(){
        this.props.events.off('preview', this._showPreview, this);
    },
    getApp : function() {
        return this.props.app;
    },
    _newState : function(options){
        var app = this.getApp();
        var useQuery = app.res.hasSearchCriteria(); 
        return _.extend({
            width: 1024,
            height: 800,
            header : false,
            mode : 'full',
            useQuery : useQuery
        }, this.state, options);
    },
    _updateDatasetSelection : function(useQuery){
        this.setState(this._newState({ useQuery : useQuery }));
    },
    _getExportUrl : function(){
        var mode = this.state.mode || 'full';
        var header = !!this.state.header;
        var useQuery = this.state.useQuery;
        var app = this.getApp();
        var options = {
            mode : mode,
            header : header,
            hash : null,
            selectedId : null
        };
        if (!useQuery) {
            _.extend(options, {
                category : null,
                search : {}
            });
        }
        var url = app.nav.getExportUrl(options);
        url = encodeURI(url);
        url = app.options.siteUrl + url;
        return url;
    },
    _showPreview : function(ev){
        var width = this.state.width;
        var height = this.state.height;
        var url = this._getExportUrl(); 
        var wnd = window.open(url,'name',
                'height=' + (height) + 'px,width=' + (width) + 'px');
    },
    getInitialState : function(){
        return this._newState();
    },
    _renderCode : function(){
        var url = this._getExportUrl();
        var width = this.state.width;
        var height = this.state.height;
        return '<iframe ' + 
                'width="' + width + '" ' + 
                'height="' + height + '" ' +
                'src="' + url + '" ' + 
                'frameborder="0">' + 
                '</iframe>';
    },
    getWidth : function(){
        return this.state.width;
    },
    getHeight : function(){
        return this.state.height;
    },
    _updateHeaderParam : function(showHeader, ev) {
        this.setState(this._newState({ header : !!showHeader }));
    },
    _updateWidth : function(ev) {
        var width = parseInt(ev.target.value) || this.state.width;
        this.setState(this._newState({ width : width }));
        ev.preventDefault();
        ev.stopPropagation();
    },
    _updateHeight : function(ev) {
        var height = parseInt(ev.target.value) || this.state.height;
        this.setState(this._newState({ height : height }));
        ev.preventDefault();
        ev.stopPropagation();
    },
    _updateMobileMode : function(ev){
        var checked = ev.target.checked;
        this.setState(this._newState({ mode : checked ? 'mobile' : 'full' }));
    },
    _onBlur : function(key, minValue, ev) {
        var value = parseInt(ev.target.value) || minValue; 
        var newValue = Math.max(value, minValue);
        if (value != newValue) {
            var options = {};
            options[key] = newValue;
            this.setState(this._newState(options));
        }
    },
    _onTextareaChange : function(){
        this.setState(this._newState());
    },
    _selectTextareaContent : function(ev){
        if (!this.isMounted())
            return ;
        var elm = ev.target;
        setTimeout(function() {
            var len = elm.value.length;
            DomUtils._selectText(elm, 0, len);
        }, 10);
    },
    render : function(){
        var leftImageUrl  = "images/export-selected.png";
        var rightImageUrl = "images/export-all.png";
        var app = this.getApp();
        var withoutHeaderClass = 'embed-type embed-without-header';
        var withHeaderClass = 'embed-type embed-with-header';
        if (this.state.header) {
            withHeaderClass += ' embed-type-active';
        } else {
            withoutHeaderClass += ' embed-type-active';
        }
        return (
            <div className="configuration-zone">
                <h3>{this._getLabel("dialog.share.title.integrate")}</h3>
                <ExportTypeSelector app={app}
                    leftImageUrl={leftImageUrl}
                    rightImageUrl={rightImageUrl}
                    useQuery={this.state.useQuery}
                    onUpdate={this._updateDatasetSelection}
                    />
                <h3>{this._getLabel("dialog.share.title.style")}</h3>
                <div className="row">
                    <div className="col-xs-6">
                        <a href="#"
                            className={withoutHeaderClass}
                            onClick={_.bind(this._updateHeaderParam, this, false)}>
                            {this._getLabel('dialog.share.label.nomenu')}
                        </a>
                    </div>
                    <div className="col-xs-6">
                        <a href="#"
                            className={withHeaderClass}
                            onClick={_.bind(this._updateHeaderParam, this, true)}>
                            {this._getLabel('dialog.share.label.withmenu')}
                        </a>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <label htmlFor="mobile-switch">{this._getLabel("dialog.share.label.mode")}</label>
                        <input
                            onChange={this._updateMobileMode}
                            id="mobile-switch"
                            type="checkbox"
                            name="mode"
                            value="mobile"
                            checked={this.state.mode === 'mobile'}/>
                    </div>
                </div>
                <h3>{this._getLabel("dialog.share.title.size")}</h3>
                <div className="row">
                    <div className="col-xs-6 form-inline">
                        <label className="">{this._getLabel("dialog.share.label.width")}</label>
                        <input
                            type="text"
                            className="embed-width"
                            onChange={this._updateWidth}
                            onBlur={_.bind(this._onBlur, this, 'width', 770)}
                            value={this.state.width} />
                    </div>
                    <div className="col-xs-6">
                        <label className="">{this._getLabel("dialog.share.label.height")}</label>
                        <input
                            type="text"
                            className="embed-height"
                            onBlur={_.bind(this._onBlur, this, 'height', 400)}
                            onChange={this._updateHeight}
                            value={this.state.height}/>
                    </div>
                </div>
                <h3>{this._getLabel("dialog.share.title.code")}</h3>
                <div className="row">
                    <div className="col-xs-12">
                        <textarea className="code embed"
                            value={this._renderCode()}
                            onChange={this._onTextareaChange}
                            onFocus={this._selectTextareaContent}/>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ShareConfigPanel;