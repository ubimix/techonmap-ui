/** @jsx React.DOM */
var _ = require('underscore');
var React = require('react');
var AppViewMixin = require('../AppViewMixin');
var TagsInfoView = require('./TagsInfoView.jsx');
var QueryInfoView = require('./QueryInfoView.jsx');
var CategoriesInfoView = require('./CategoriesInfoView.jsx');
var ZoneInfoView = require('./ZoneInfoView.jsx');
var I18NMixin = require('../utils/I18NMixin');

module.exports = React.createClass({

    displayName : 'SearchInfoBlock',

    mixins : [ I18NMixin, AppViewMixin ],

    _getStore : function(){
        return this.props.app.res;
    },
    
    _newState : function(){
        return { };
    },
    
    componentWillMount : function(){
         var app = this.props.app;
         app.res.addSearchCriteriaChangeListener(this._onSearchCriteriaUpdate);
    },
    
    componentWillUnmount : function(){
         var app = this.props.app;
         app.res.removeSearchCriteriaChangeListener(this._onSearchCriteriaUpdate);
    },
    
    _onSearchCriteriaUpdate : function(){
        this.setState(this._newState());
    },
    
    _renderSearchQueryInfo : function(){
        var app = this.props.app;
        if (!app.res.hasSearchQuery())
            return '';
        return (
            <ul className="list-group search-query">
                <li className="list-group-item">
                    <span className="criteria-reminder-title">{this._getLabel('toolbar.left.label.query')}</span>
                    <QueryInfoView app={app} />
                    {this._renderRemoveBtn({
                        onClick: function(){
                            app.res.setSearchQuery('');
                        }
                    })}
                </li>
            </ul>
        );
    },

    _renderTagsInfo : function(){
        var app = this.props.app;
        if (!app.res.hasFilterTags())
            return '';
        return (
            <ul className="list-group search-tags">
                <li className="list-group-item">
                    <span className="criteria-reminder-title">{this._getLabel('toolbar.left.label.tags')}</span>
                    <TagsInfoView app={app} hideEmpty={true}/>
                    {this._renderRemoveBtn({
                        onClick: function(){
                            app.res.toggleTags([]);
                        }
                    })}
                </li>
            </ul>
        );
    },

    _renderRemoveBtn : function(options){
        var app = this.props.app;
        var removeBtn = '';
        if (!app.ui.canChangeSearchQueries()) 
            return ;
        return [
            <span className="bar"></span>,
            <a href="#" className="remove" onClick={function(ev){
                options.onClick(ev);
                ev.stopPropagation();
                ev.preventDefault();
            }}></a>
        ]; 
    },

    _renderCategoriesInfo : function(){
        var app = this.props.app;
        if (!app.res.hasFilterCategories())
            return '';
        return (
            <ul className="list-group search-categories">
                <li className="list-group-item">
                    <span className="criteria-reminder-title">{this._getLabel('toolbar.left.label.categories')}</span>
                    <CategoriesInfoView app={app}/>
                    {this._renderRemoveBtn({
                        onClick: function(){
                            app.res.toggleCategories([]);
                        }
                    })}
                </li>
            </ul>
        );
    },

    _renderZonesInfo : function(){
        var app = this.props.app;
        if (!app.res.hasZonesFilter())
            return '';
        return (
            <ul className="list-group search-zones">
                <li className="list-group-item">
                    <span className="criteria-reminder-title">{this._getLabel('toolbar.left.label.zone')}</span>
                    <ZoneInfoView app={app}/>
                    {this._renderRemoveBtn({
                        onClick: function(){
                            app.res.toggleZones([]);
                        }
                    })}
                </li>
            </ul>
        );
    },

    render : function() {
        var app = this.props.app;
        return (
            <div className={this.props.className}>
                {this._renderSearchQueryInfo()}
                {this._renderZonesInfo()}
                {this._renderCategoriesInfo()}
                {this._renderTagsInfo()}
            </div>
        );
    }
});
