/** @jsx React.DOM */
var _ = require('underscore');
var React = require('react');
var AppViewMixin = require('../AppViewMixin');
var CategoryMixin = require('../utils/CategoryMixin.jsx');
var I18NMixin = require('../utils/I18NMixin');

module.exports = React.createClass({
    displayName : 'CategoriesInfoView',
    mixins : [AppViewMixin, I18NMixin, CategoryMixin],
    _newState : function(options){
        var res = this._getStore();
        var categories = res.getFilterCategories();
        return { categories : categories };
    },
    _getStore : function(){
        return this.props.app.res;
    },
    render : function() {
        return this._renderCategoryList(this.state.categories);
    }
});
