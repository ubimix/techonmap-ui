/** @jsx React.DOM */
var _ = require('underscore');
var React = require('react');
var TagsMixin = require('../utils/TagsMixin.jsx');
var I18NMixin = require('../utils/I18NMixin');
var Formats = require('../utils/Formats');
var ResourceUtils = require('../../tools/ResourceUtilsMixin');

module.exports = _.extend({

     getApp : function() {
         return this.props.app;
     },
    _selectResource : function(ev){
        var app = this.getApp();
        var resourceId = this.props.resourceId;
        app.selection.toggleResource({
            resourceId : resourceId
        });
        ev.preventDefault();
        ev.stopPropagation();
    },
    
    _renderName : function(){
        var name = ResourceUtils.getResourceName(this.props.resource);
        return (
           <span className="name">{name}</span>
        );
    },
    
    _renderShortDescription : function(type) {
        var creationYear = ResourceUtils.getResourceCreationYear(this.props.resource);
        var creationYearText = '';
        if (creationYear){
            var app = this.getApp();
            var i18n = app.i18n;
            var typeKey = app.res.getCategoryIcon(type);
            var msgKey = 'list.item.view.' + typeKey + '.creationYear';
            creationYearText = i18n.getMessage(msgKey, { year: creationYear });
        }
        return <div className="short-description">
            {creationYearText}
        </div>
    },
    
    _renderUrl : function(){
        var urlStr = ResourceUtils._getFirstProperty(this.props.resource, 'url');
        var url = Formats._formatUrl(urlStr);
        return <div className="url">
            <a href={url.url} className="website" target="_blank">{url.label}</a>
        </div>
    },
    
    _renderAddress : function() {
        var resource = this.props.resource;
        var address = Formats._formatAddr(resource.properties);
        return <div className="address">
            {address}
        </div>
    },

    _renderSocialNetworks : function(isSelected) {
        var showLabels = !!isSelected; 
        return <div className="social-networks">
            <ul>
                {this._getIconLink('url', showLabels)}
                {this._getIconLink('twitter', showLabels)}
                {this._getIconLink('facebook', showLabels)}
                {this._getIconLink('viadeo', showLabels)}
                {this._getIconLink('linkedin', showLabels)}
                {this._getIconLink('googleplus', showLabels)}
            </ul>
        </div>
    },
    
    _renderDescription : function(isSelected) {
        if (isSelected) {
            var desc = ResourceUtils._getFirstProperty(this.props.resource, 'description');
            return <div className="description">
                    {desc}
            </div>
        } else 
            return;
    },
    
    _renderShare : function(isSelected) {
        if (isSelected) {
            var id = ResourceUtils._getFirstProperty(this.props.resource, 'id');
            var url = this._getLabel("list.item.view.link", { id: id });
            var encodedUrl = encodeURIComponent(url);
            var twitter = 'https://twitter.com/intent/tweet?source=webclient&text='+encodedUrl;
            var facebook = 'http://www.facebook.com/sharer/sharer.php?u='+encodedUrl;
            var linkedin = 'http://www.linkedin.com/shareArticle?mini=true&url='+encodedUrl;
            var viadeo = 'http://www.viadeo.com/shareit/share/?url='+encodedUrl;
            var googlePlus = 'https://plus.google.com/share?url='+encodedUrl;
            var share = this._getLabel("list.item.share.label");
            return (<div className="share">
                <div className="left">Partager :</div>
                <input type="text" className="input-permalink" disabled="disabled" value={url} />
                <div className="right">
                    <a href={twitter} target="_blank">
                        <img src="images/share/twitter.png" alt={this._getLabel("list.item.share.twitter")} />
                    </a> 
                    <a href={facebook} target="_blank">
                        <img src="images/share/facebook.png" alt={this._getLabel("list.item.share.facebook")} />
                    </a> 
                    <a href={linkedin} target="_blank">
                        <img src="images/share/linkedin.png" alt={this._getLabel("list.item.share.linkedin")} />
                    </a> 
                    <a href={viadeo} target="_blank">
                        <img src="images/share/viadeo.png" alt={this._getLabel("list.item.share.viadeo")} />
                    </a> 
                    <a href={googlePlus} target="_blank">
                        <img src="images/share/google-plus.png" alt={this._getLabel("list.item.share.googleplus")}/>
                    </a>
                </div>
                <div className="clear"></div>
            </div>);            
        } else 
            return;
    },    
    
    _getIconLink : function(propName, withLabel) {
        var propIcons = {'url':'web', 'googleplus': 'google-plus'};
        var propValue = ResourceUtils._getFirstProperty(this.props.resource, propName);
        if (propName == 'twitter')
            propValue = this._getTwitterUrl(propValue);
        var iconName = propIcons[propName] ? propIcons[propName] : propName;
        var iconClassName = "icon icon-"+iconName;
        if (propValue) {
            if (withLabel) {
                var urlAndLabel = Formats._formatUrl(propValue);
                var label = urlAndLabel.label;
                var url = urlAndLabel.url;
                return <li><a href={url} target="_blank">
                <i className={iconClassName}></i> {label}
                </a></li>
            } else {
            	var urlAndLabel = Formats._formatUrl(propValue);
            	var url = urlAndLabel.url; 
                return <a href={url} target="_blank">
                <i className={iconClassName}></i>
                </a>    
            }
        } else {
            iconClassName += " icon-off";
            if (!withLabel)
                return  <i className={iconClassName}></i>;
            return;
        }
        
    },
    
    _getTwitterUrl : function(account) {
        if (!account)
            return null;
        if (account.indexOf('http') != 0)
            return 'https://twitter.com/'+account;
        return account;
        
    },
    
    /** Renders an icon element. */
    _renderIcon  : function(iconOptions) {
        var src = iconOptions.src;
        var img;
        if (src) {
            img = <img src={src}/>; 
        }
        var isStar = iconOptions.isStar;
        if (isStar) {
            isStar = <i className="star icon icon-star"></i>;
        }
        var className = 'search-result-icon';
        if (iconOptions.className) {
            className += ' ' + iconOptions.className;
        }
        return (
            <div className={className}>
                {img}
                {isStar}
            </div>
        );
    },
    
}, TagsMixin, I18NMixin);
