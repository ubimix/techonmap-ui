/**
 * @jsx React.DOM
 */
var _ = require('underscore');
var React = require('react');
var Mosaic = require('mosaic-commons');
var AppViewMixin = require('../AppViewMixin');
var I18NMixin = require('../utils/I18NMixin');

var SearchInputBoxView = React.createClass({
    displayName : 'SearchInputBoxView',
    mixins : [ I18NMixin ],
    getApp : function(){
        return this.props.app;
    },
    render : function(){
        var value = this.state.value||'';
        return (
            <form className={this.props.className} role="search" id={this.props.id}>
               <div className="input-group">
                   {this._renderSearchButton()}
                   <input ref="inputBox" type="text" className="form-control"
                       onChange={this._onInputChange}
                       onKeyDown={this._onKeyDown}
                       value={value}
                       placeholder={this._getLabel('search.panel.placeholder.input')}/>
                   {this._renderClearButton()}
               </div>
           </form>
       ); 
    },
    _renderSearchButton : function(){
        return (
            <a href="#" className="input-group-addon search-run" onClick={this._runSearch}>
                <i className="glyphicon glyphicon-search"></i>
            </a>
        );
    },
    _renderClearButton : function(){
        var value = this.state.value;
        if (value && value != '' ) {
            return (
                <a href="#" className="input-group-addon search-clear" onClick={this._clearSearch}>
                    <i className="glyphicon glyphicon-remove"></i>
                </a>
            );
        }
        return undefined;
    },
    getInitialState : function(){
        return this._newState();
    },
    componentWillMount : function(){
        var app = this.props.app;
        this._setQuery = _.debounce(this._setQuery, 250);
        app.res.addSearchCriteriaChangeListener(this._onSearch);
    },
    componentDidMount : function(){
        this.refs.inputBox.getDOMNode().focus(); 
    },
    componentWillUnmount : function(){
         var app = this.props.app;
         app.res.removeSearchCriteriaChangeListener(this._onSearch);
    },
    _clearSearch : function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        this.setState(this._newState({
            value : ''
        }));
        this._setQuery('');
    },
    _runSearch : function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var value = this.state.value;
        this._setQuery(value);
    },
    _setQuery : function(query){
        var app = this.props.app;
        app.res.setSearchQuery(query);
    },
    _newState : function(options){
        var query = this.props.app.res.getSearchQuery();
        return _.extend({ 
            value : query
        }, this.state, options); 
    },
    _onInputChange : function(ev){
        var query = ev.target.value;
        this._setQuery(query);
        this.setState(this._newState({
            value : query
         }));
    },
    _onKeyDown : function(ev) {
        var code = ev.which;
        var cancel = false;
        if (code === 13) { // ENTER
            var value = this.state.value;
            this._setQuery(value);
            cancel = true;
        } else if (code === 27) { // ESC
            this._clearSearch(ev);
        }
        if (cancel){
            ev.preventDefault();
            ev.stopPropagation();
        }
    },
    _onSearch : function(){
        var query = this.props.app.res.getSearchQuery();
        this.setState(this._newState({
            value : query
         }));
    },
});

module.exports = SearchInputBoxView;
 