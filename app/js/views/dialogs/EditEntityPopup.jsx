/**
 * @jsx React.DOM
 */
'use strict';
var _ = require('underscore');
var React = require('react');
var Mosaic = require('mosaic-commons');
var I18NMixin = require('../utils/I18NMixin');
var DomUtils = require('../utils/DomUtils');
var PopupPanel = require('mosaic-core').React.PopupPanel;
var ContentPopupMixin = require('../utils/ContentPopupMixin');
var EditEntityForm = require('./EditEntityForm.jsx');
var MessageBoxMixin = require('../utils/MessageBoxMixin.jsx');

var EditEntityPopup = Mosaic.Class.extend(DomUtils, I18NMixin, MessageBoxMixin, // 
Mosaic.Events.prototype, ContentPopupMixin, {

    initialize : function(options) {
        this.setOptions(options);
    },
    getApp : function() {
        return this.options.app;
    },
    _submitForm : function(ev) {
        var that = this;
        var app = this.getApp();
        app.edit.validateResource().then(function(results){
            if (app.edit.isValid()) {
                app.edit.endEdit({
                   save : true 
                }).then(function(result){
                    var title = that._getLabel('dialog.edit.result.ok.title');
                    var msg = that._getLabel('dialog.edit.result.ok');
                    that._showMessage(title, msg);
                }, function(err) {
                    var title = that._getLabel('dialog.edit.result.error.title');
                    var msg = that._getLabel('dialog.edit.result.error');
                    var ok = that._getLabel('dialog.ok');
                    that._showMessage(title, msg, ok);
                });
            } else {
                var title = that._getLabel('dialog.edit.result.error.title');
                var msg = that._getLabel('dialog.edit.result.error');
                var ok = that._getLabel('dialog.ok');
                that._showMessage(title, msg, ok);
            }
        })
        ev.preventDefault();
        ev.stopPropagation();
    },
    _openPopup : function(resource) {
        var that = this;
        resource = resource || {};
        var app = that.options.app;
        var closeListener = function(){
            if (!app.edit.isEditing()) {
                app.edit.removeChangeListener(closeListener);
                PopupPanel.closePopup();
            }
        };
        app.edit.addChangeListener(closeListener);
        app.edit.startEdit({
            resource: resource
        }).then(function(){
            var dialog;
            var form = (
                <EditEntityForm app={that.getApp()} key="editform"/>
            );
            var footer = (
                <div key="footer">
                    <button type="submit" className="btn btn-primary"
                        onClick={that._submitForm.bind(that)}>
                        {that._getLabel('dialog.edit.btn.save')}
                    </button>
                    <button type="button" className="btn" onClick={function(){
                            PopupPanel.closePopup();
                        }}>
                        {that._getLabel('dialog.edit.btn.cancel')}
                    </button>
                </div>
            );
            var title = that._getLabel('dialog.edit.title');
            return PopupPanel.openPopup({
                title : title,
                body : form,
                footer : footer,
                key: "edit-popup",
                disableEsc : true,
                onOpen : function(d) {
                    dialog = d;
                },
                onClose : function(d){
                    app.edit.removeChangeListener(closeListener);
                    dialog = null;
                },
                verticalMargin : 40
            });            
        });
    },
    open : function(resource) {
        var that = this;
        var app = that.options.app;
       
        var user =  app.user.getUserInfo();
        if (!!user) {
            return that._openPopup(resource);
        } 
        return that._login().then(function(){
            return app.user.loadUserInfo().then(function(user){
                if (!!user) {
                    return that._openPopup(resource);
                } else {
                    throw new Error('You are not logged in!');
                }
            });
        }).then(null, function showLoginErrorMsg(err){
            var msg = that._getLabel('dialog.edit.login.error', {
                error : err
            });
            var title = that._getLabel('dialog.edit.login.error.title');
            that._showMessage(title, msg);
        });
    },
    
    _login : function(){
        var that = this;
        var app = that.getApp();
        var deferred = Mosaic.P.defer();
        var wnd;
        function checkLoginWindow() {
            if (!wnd)
                return ;
            if (wnd.closed) {
                clearInterval(checkLoginWindow.timerId);
                onLoginFinished({cancel : true});
                wnd = null;
            }
        }
        function onLoginFinished(result) {
            if (!wnd)
                return ;
            if (!result.cancel && result.user) {
                deferred.resolve();
            } else {
                deferred.reject();
            }
            delete window.onLoginFinished;
            if (wnd) {
                wnd.close();
            }
        }        
        window.onLoginFinished = onLoginFinished;
        var popupWidth = 850;
        var popupHeight = 500;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;

        var minLeft = 0;
        var minTop = 100;
        var left = Math.max(Math.round((windowWidth - popupWidth)/ 2), minLeft);
        var top = Math.max(Math.round((windowHeight - popupHeight) / 2), minTop);
        var options = 'location=no,resizable=yes,menubar=no,' + 
        'scrollbars=no,status=no,titlebar=no,toolbar=no,' +
        'width=' + popupWidth + ',height=' + popupHeight + ',' +
        'top=' + top + ',left=' + left + '';
        wnd = window.open('./login.html', 'login', options);
        checkLoginWindow.timerId = setInterval(checkLoginWindow, 500);
        return deferred.promise;
    }
});

module.exports = EditEntityPopup;
