/**
 * @jsx React.DOM
 */
'use strict';
var _ = require('underscore');
var React = require('react');
var Mosaic = require('mosaic-commons');
var DomUtils = require('../utils/DomUtils');
var I18NMixin = require('../utils/I18NMixin');

var ExportTypeSelector = React.createClass({
    displayName: "ExportTypeSelector",
    mixins : [I18NMixin],
    componentDidMount : function(){
    },
    componentWillUnmount : function(){
    },
    getApp : function() {
        return this.props.app;
    },
    _newState : function(options){
        var state = _.extend({
            useQuery : this.props.useQuery
        }, this.state, options);
        return state;
    },
    getInitialState : function(){
        return this._newState();
    },
    _useQuery : function(useQuery){
        var state = this._newState({useQuery : useQuery});
        if (this.props.onUpdate){
            this.props.onUpdate(state.useQuery);
        }
        this.setState(state);
    },
    _onUseQuery : function(useQuery, ev){
        this._useQuery(useQuery);
        ev.stopPropagation();
        ev.preventDefault();
    },
    _onChange : function(useQuery, ev){
        this._useQuery(useQuery);
    },
    render : function(){
        var leftChecked = !!this.state.useQuery;
        var rightChecked = !leftChecked;
        return (
            <div className="row export-type-selector">
                <div className="col-xs-6">
                    <div className="media">
                        <a className="media-left" href="#"
                            onClick={_.bind(this._onUseQuery, this, true)}>
                            <img alt="" src={this.props.leftImageUrl} />
                        </a>
                        <div className="media-body">
                            <label onClick={_.bind(this._onChange, this, true)}>
                                <input type="radio" checked={leftChecked}
                                    onChange={_.bind(this._onChange, this, true)}/>
                                {this._getLabel('dialog.export.label.export.filtered')}
                            </label>
                        </div>
                    </div>
                </div>
                <div className="col-xs-6">
                    <div className="media">
                        <a className="media-left" href="#" 
                            onClick={_.bind(this._onUseQuery, this, false)}>
                            <img alt="" src={this.props.rightImageUrl} />
                        </a>
                        <div className="media-body">
                            <label onClick={_.bind(this._onChange, this, false)}>
                                <input type="radio" checked={rightChecked}
                                    onChange={_.bind(this._onChange, this, false)}/>
                                {this._getLabel('dialog.export.label.export.all')}
                            </label>
                        </div>
                    </div>
                </div>
            </div>              
        );
    }
});
 
module.exports = ExportTypeSelector;
