/**
 * @jsx React.DOM
 */
'use strict';
var _ = require('underscore');
var React = require('react');
var Mosaic = require('mosaic-commons');
var I18NMixin = require('../utils/I18NMixin');
var PopupPanel = require('mosaic-core').React.PopupPanel;
var ContentPopupMixin = require('../utils/ContentPopupMixin');
var ShareConfigPanel = require('./ShareConfigPanel.jsx');

var SharePopup = Mosaic.Class.extend(I18NMixin, Mosaic.Events.prototype, 
        ContentPopupMixin, {

    initialize : function(options){
        this.setOptions(options);
    },
    getApp : function() {
        return this.options.app;
    },
    _renderTabs : function(){
        return (
            <ul className="nav nav-tabs">
                <li><span>{this._getLabel('search.label.sort')}</span></li>
                <li>
                    <a href="#" onClick={this._sortByName}>
                        {this._getLabel('search.label.sort.name')}
                    </a>
                </li>
                <li>
                    <a href="#" onClick={this._sortByDate}>
                        {this._getLabel('search.label.sort.date')}
                    </a>
                </li>
            </ul>                
        );
    },
    
    _renderPanel : function(){
        var app = this.getApp();
        return (
            <div>
                <ShareConfigPanel app={app} events={this}/>
            </div>
        );
    },
    open : function() {
        var title = (
            <span>
                <i className="icon icon-share"></i>
                {this._getLabel('dialog.share.title')}
            </span>
        );
        var app = this.getApp();
        var panel = this._renderPanel();
        var showPreviewBtn = this._getLabel('dialog.share.btn.preview');
        var closePopupBtn = this._getLabel('dialog.share.btn.close');
        var that = this;
        var footerElm = (
           <div>
               <button className="btn btn-primary"
                   onClick={function() { that.fire('preview'); }}>
                   {showPreviewBtn}
               </button>
               <button className="btn"
                   onClick={function(){ PopupPanel.closePopup(); }}>
                   {closePopupBtn}
               </button>
           </div>
        );
        PopupPanel.openPopup({
            title : title,
            body : panel,
            footer : footerElm,
            verticalMargin : this.options.margin || 40
        });

    },
 
});

module.exports = SharePopup;
