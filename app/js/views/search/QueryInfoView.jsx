/** @jsx React.DOM */
var _ = require('underscore');
var React = require('react');
var AppViewMixin = require('../AppViewMixin');
var I18NMixin = require('../utils/I18NMixin');

module.exports = React.createClass({
    displayName : 'QueryInfoView',
    mixins : [AppViewMixin, I18NMixin],
    _newState : function(options){
        var res = this._getStore();
        var q = res.getSearchQuery();
        return { q : q };
    },
    _getStore : function(){
        return this.props.app.res;
    },
    _onClick : function(ev){
        var app = this.props.app;
        if (app.ui.canChangeSearchQueries()) {
            var res = this._getStore();
            res.setSearchQuery('');
        }
    },
    render : function() {
        var app = this.props.app;
        var query = this.state.q;
        return (
            <span onClick={this._onClick} className="query selected">
                <span className='query-label'>{query + ' '}</span>
            </span>
        );
    }
});
