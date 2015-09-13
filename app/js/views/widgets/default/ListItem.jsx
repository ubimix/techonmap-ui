/** @jsx React.DOM */
var _ = require('underscore');
var React = require('react');
var ListItemMixin = require('../ListItemMixin.jsx');
var ResourceUtils = require('../../../tools/ResourceUtilsMixin');
var ViewActivationMixin = require('../../utils/ViewActivationMixin');
var EditEntityPopup = require('../../dialogs/EditEntityPopup.jsx');

module.exports = React.createClass({
    displayName : 'List.Default',
    mixins: [ListItemMixin, ViewActivationMixin],
 
    _renderViewFocusButtons : function(){
        return(
            <div className="toolbar">
                <a href='#' onClick={this._activateView.bind(this, 'map')}>
                    <i className="icon icon-map">
                    </i>
                </a>
            </div>
        )
    },
    
    _editResource : function(ev){
        ev.stopPropagation();
        ev.preventDefault();
        var editPopup = new EditEntityPopup({
            app : this.props.app
         });
         editPopup.open(this.props.resource);  
    },
    
    _renderEditButton : function() {
        var id = ResourceUtils._getFirstProperty(this.props.resource, 'id');
        var editLink = this._getLabel("list.item.edit.link", { id: id });
        var editTitle = this._getLabel("list.item.edit.title", { id: id });
        return(
            <div className="toolbar">
                <a href={editLink} title={editTitle}
                    className="edit picto-edit" target="_blank"
                    onClick={this._editResource}>
                    <i className="icon icon-edit"></i>
                </a>
            </div>
        )
    },
    
    _handleClick : function(ev){
        this.props.onClick(ev);
        ev.preventDefault();
        ev.stopPropagation();
    },
    
    render: function() {
        var app = this.props.app;
        var resource = this.props.resource;
        var resourceId = app.res.getResourceId(resource);
        var selected = app.res.isSelectedResource(resourceId);
        var resourceType = app.res.getResourceType(resource);
        var pos = this.props.pos + 1;
        var className = 'media list-group-item ';
        if (selected){
            className += ' selected '
        }
        var toolbar = [];
        if (selected){
            if (app.ui.isMobileMode()) {
                toolbar.push(this._renderViewFocusButtons());
            } else {
                toolbar.push(this._renderEditButton());
            }
        }
        
        var icon = app.res.getCategoryIcon(resourceType);
        var pictoClassName = 'picto ' + icon;
        var iconClassName = 'icon icon-' + icon;
        className += resourceType;
        return (
            <div className={className} key={this.props.key}>
                <div className="media-left">
                    <div className={pictoClassName}>
                        <a href="#" onClick={this.props.onClick}>
                            <i className={iconClassName}></i>
                        </a>
                    </div>
                </div>
                <div className="media-body">
                  {toolbar}
                  <div className="media-heading">
                      <h4>
                          <a href="#" onClick={this._handleClick}>
                              {this._renderName()}
                          </a>
                      </h4>
                  </div>
                  {this._renderShortDescription(resourceType)}
                  {this._renderTags(true)}
                  {this._renderDescription(selected)}
                  {this._renderAddress()}
                  {this._renderSocialNetworks(selected)}
                  {
                      // this._renderShare(selected)
                  }
                </div>
            </div>
        );            
    },
});
 