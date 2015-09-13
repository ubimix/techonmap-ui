/** @jsx React.DOM */
var _ = require('underscore');
var React = require('react');

var CategoryMixin = {
    _selectCategory : function(category, ev) {
        var app = this.props.app;
        if (app.ui.canChangeSearchQueries()) {
            var promise = app.res.toggleCategories([category]);
            if (this.props.onSelectCategory) {
                var that = this;
                promise.then(function(){
                    that.props.onSelectCategory(category);
                });
            }
        }
        ev.stopPropagation();
        ev.preventDefault();
    },
    _renderCategory : function(category, options){
        var app = this.props.app;
        var selected = app.res.isFilteredByCategory(category);
        var categoryKey = app.res.getCategoryKey(category);
        var categoryLabel = category.label;
        options = options || {};
        var className = selected ? 'category selected' : 'category';
        var that = this;
        return (
            <span
                onClick={function(ev) {
                    var select = true;
                    if (options && options.onClick) {
                        var r = options.onClick(category);
                        select = (r === undefined) || !!r;
                    }
                    if (select){
                        that._selectCategory(category, ev);
                    }
                }}
                className={className}
                key={categoryKey}>
                <i className={'icon icon-' + category.icon} />
                <span className='category-label'>{categoryLabel + ' '}</span>
            </span>
        );
    },
    _renderCategoryList : function(categories) {
        var list = _.map(categories, this._renderCategory, this);
        if (!list.length) {
            list = [
               <span className="category none">
                   <span className="category-label">
                       {this._getLabel('filter.label.categories.all')}
                   </span>
               </span>
            ];
        }
        return <span className="categories categories-inline">{list}</span>
    },
};

module.exports = CategoryMixin;