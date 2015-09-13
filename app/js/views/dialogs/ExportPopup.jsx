/**
 * @jsx React.DOM
 */
'use strict';
var _ = require('underscore');
var React = require('react');
var Mosaic = require('mosaic-commons');
var DomUtils = require('../utils/DomUtils');
var I18NMixin = require('../utils/I18NMixin');
var ContentPopupMixin = require('../utils/ContentPopupMixin');
var ExportTypeSelector = require('./ExportTypeSelector.jsx');
var PopupPanel = require('mosaic-core').React.PopupPanel;

var FORMAT_CSV = 'csv';
var FORMAT_JSON = 'json';

var STAGE_NO_DATA = 0;
var STAGE_LOADING = 1;
var STAGE_LOADED = 2;

var ExportConfigPanel = React.createClass({
    displayName: "ExportConfigPanel",
    mixins : [I18NMixin],
    componentWillMount : function(){
        this.props.events.on('export', this._updateExportFormat, this);
    },
    componentWillUnmount : function(){
        this.props.events.off('export', this._updateExportFormat, this);
    },
    getApp : function() {
        return this.props.app;
    },
    _newState : function(options){
        var app = this.getApp();
        var useQuery = app.res.hasSearchCriteria(); 
        return _.extend({
            format : FORMAT_CSV,
            useQuery : useQuery,
            stage : STAGE_NO_DATA,
            data : ""
        }, this.state, options);
    },
    _prepareData : function(useQuery, format){
        var app = this.getApp();
        var data = useQuery ? app.res.getResources() : app.res.getAllResources();
        var result;
        if (format == FORMAT_CSV) {
            result = app.serialize.formatAsCSV(data);
        } else {
            result = app.serialize.formatAsJson(data); 
        }
        return result;
    },
    _updateExportFormat : function(options) {
        var state = this._newState(options);
        state.stage = STAGE_LOADING;
        state.data = "";
        var that = this;
        that.setState(state);
        setTimeout(function(){
            state.stage = STAGE_LOADED;
            state.data = that._prepareData(state.useQuery, state.format);
            that.setState(state);
        }, 50);
    },
    _updateDatasetSelection : function(useQuery){
        this.setState(this._newState({ useQuery : useQuery }));
    },
    getInitialState : function(){
        return this._newState();
    },
    _onTextareaChange : function(){
        this._updateExportFormat();
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
    _showData : function(){
        if (!this.state.stage)
            return '';
        var data = '';
        var disabled = true;
        if (this.state.stage === STAGE_LOADING) {
            data = this._getLabel("dialog.export.msg.prepare");
        } else {
            data = this.state.data;
            disabled = false;
        }
        return (
            <div className="row">
                <div className="col-xs-12">
                    <textarea className="code embed"
                        value={data}
                        disabled={disabled}
                        onChange={this._onTextareaChange}
                        onFocus={this._selectTextareaContent}/>
                </div>
            </div>
        );
    },
    render : function(){
        var leftImageUrl  = "images/export-selected.png";
        var rightImageUrl = "images/export-all.png";
        var app = this.getApp();
        return (
           <div>
               <div className="configuration-zone">
                   <p>{this._getLabel("dialog.export.description")}</p>
                   <h3>{this._getLabel("dialog.export.title.query")}</h3>
                   <ExportTypeSelector app={app}
                        leftImageUrl={leftImageUrl}
                        rightImageUrl={rightImageUrl}
                        useQuery={this.state.useQuery}
                        onUpdate={this._updateDatasetSelection}
                        />

                    <h3>{this._getLabel("dialog.export.title.format")}</h3>
                    {this._showData()}
                </div>
           </div>                
        );
    }
});

var ExportPopup = Mosaic.Class.extend(I18NMixin, ContentPopupMixin, {
    initialize : function(options){
        this.setOptions(options);
    },
    getApp : function() {
        return this.options.app;
    },
    open : function() {
        var title = (
            <span>
                <i className="icon icon-export"></i>
                {this._getLabel('dialog.export.title')}
            </span>
        );
        var app = this.getApp();
        var events = new Mosaic.Events();
        this._panel = (<ExportConfigPanel app={app} events={events}/>);
        var that = this;
        var footerElm = (
           <div>
               <div className="row">
                   <div className="col-xs-6 text-center">
                       <button type="button" className="btn btn-primary"
                           onClick={function() { events.fire('export', { format: FORMAT_CSV }); }}>
                           {this._getLabel('dialog.export.btn.csv')}
                       </button> 
                   </div>
                   <div className="col-xs-6 text-center">
                       <button type="button" className="btn btn-primary"
                           onClick={function() { events.fire('export', { format: FORMAT_JSON }); }}>
                           {this._getLabel('dialog.export.btn.json')}
                       </button>        
                   </div>
               </div>
           </div>
        );
        PopupPanel.openPopup({
            title : title,
            body : this._panel,
            footer : footerElm,
            verticalMargin : this.options.margin || 40
        });

    },
 
});

module.exports = ExportPopup;
