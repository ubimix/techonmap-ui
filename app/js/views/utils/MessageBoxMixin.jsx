/**
 * @jsx React.DOM
 */
'use strict';
var _ = require('underscore');
var React = require('react');
var PopupPanel = require('mosaic-core').React.PopupPanel;

module.exports = {
    _showMessage : function(msgTitle, msg, okLabel) {
        var app = this.getApp();
        var that = this;
        PopupPanel.openPopup({
            verticalMargin : this.options.margin || 40,
            title : (
                <span>
                    <i className="icon icon-share"></i>
                    {msgTitle}
                </span>
            ),
            body : <div>{msg}</div>,
            footer : (
                <div>
                    <button className="btn  btn-primary"
                        onClick={function(){ PopupPanel.closePopup(); }}>
                        {okLabel || this._getLabel('dialog.contact.btn.cancel')}
                    </button>
                </div>
             ),
        });
    },
};