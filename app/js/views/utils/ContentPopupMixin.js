'use strict';
var _ = require('underscore');
var React = require('react');
var PopupPanel = require('mosaic-core').React.PopupPanel;

module.exports = {

    _loadContent : function(options) {
        var that = this;
        var app = that.getApp();
        return app.content.loadContent(options);
    },

    _loadFormattedViews : function(options) {
        var that = this;
        return that._loadContent(options).then(function(obj) {
            var title = obj.getAsHtml('title');
            var content = obj.getContentAsHtml();
            var footer = options.footer || obj.getAsHtml('footer');
            var titleElm = React.DOM.span({
                dangerouslySetInnerHTML : {
                    __html : title
                }
            });
            var bodyElm = React.DOM.span({
                dangerouslySetInnerHTML : {
                    __html : content
                }
            });
            var footerElm;
            if (_.isString(footer)) {
                footerElm = React.DOM.span({
                    dangerouslySetInnerHTML : {
                        __html : footer
                    }
                });
            } else {
                footerElm = footer;
            }
            return {
                titleElm : titleElm,
                bodyElm : bodyElm,
                footerElm : footerElm,
                obj : obj
            };
        });
    },

    _showContentDialog : function(options) {
        var that = this;
        return that._loadFormattedViews(options).then(function(views) {
            PopupPanel.openPopup({
                title : views.titleElm,
                body : views.bodyElm,
                footer : views.footerElm,
                onOpen : options.onOpen,
                onClose : options.onClose,
                verticalMargin : options.margin || 40
            });
        });
    },
};
