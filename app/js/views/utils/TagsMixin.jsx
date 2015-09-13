/** @jsx React.DOM */
var _ = require('underscore');
var React = require('react');
var ResourceUtils = require('../../tools/ResourceUtilsMixin');

module.exports =  {
    _selectTag : function(tag, ev) {
        var app = this.props.app;
        if (app.ui.canChangeSearchQueries()) {
            app.res.toggleTags([tag]);
            if (this._onSelectTag){
                this._onSelectTag(ev);
            }
        }
        ev.stopPropagation();
        ev.preventDefault();
    },
    _renderTags : function(hideEmpty){
        var tags = ResourceUtils.getResourceTags(this.props.resource);
        return this._renderTagList(tags, hideEmpty);
    },
    _renderTag : function(tag){
        var app = this.props.app;
        var selected = app.res.isFilteredByTag(tag);
        tag = app.res.getTagKey(tag);
        var className = selected ? 'tag selected' : 'tag';
        return (
            <span
                onClick={_.bind(this._selectTag, this, tag)}
                className={className}
                key={tag}>
                <span className='tag-label'>{tag + ' '}</span>
            </span>
        );
    },
    _renderTagList : function(tags, hideEmpty) {
        var tags = _.map(tags, this._renderTag, this);
        if (!tags.length) {
            if (hideEmpty) {
                return ;
            }
            tags = [
               <span className="tag none">
                   {this._getLabel('filter.label.tags.all')}
               </span>
            ];
        }
        return <span className="tags tags-inline">{tags}</span>
    },
};
