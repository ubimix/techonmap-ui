/** @jsx React.DOM */
var _ = require('underscore');
var React = require('react');

var FullscreenTopZoneView = require('./FullscreenTopZoneView.jsx');
var FullscreenMiddleZoneView =  require('./FullscreenMiddleZoneView.jsx');
var BottomZoneView = require('./BottomZoneView.jsx');
var TopSocialBar = require('./TopSocialBar.jsx');
var PopupPanel = require('mosaic-core').React.PopupPanel;

module.exports = React.createClass({
    displayName : 'MainView',
    componentDidMount : function(){
        var elm = this.getDOMNode();
        PopupPanel.setPopupContainer(elm);
    },
    render : function() {
        var app = this.props.app;
        var showHeaders = app.ui.showHeader();
        var className = 'main-zone fullscreen-mode';
        var headers; 
        if (showHeaders) {
            headers = [
                <TopSocialBar app={app} className="social" />,
                <FullscreenTopZoneView app={app} className="top-zone"/>
            ];
        } else {
            className += ' no-headers';
        }
        return (
            <div className={className}>
                {headers}
                <FullscreenMiddleZoneView app={app} className="middle-zone"/>
                <BottomZoneView app={app} className="bottom-zone"/>
            </div>
        );
    }
});
