/** @jsx React.DOM */
var _ = require('underscore');
var React = require('react');
var AppViewMixin = require('../AppViewMixin');
var ZonesMixin = require('../utils/ZonesMixin.jsx');
var I18NMixin = require('../utils/I18NMixin');

module.exports = React.createClass({
    displayName : 'ZoneInfoView',
    mixins : [AppViewMixin, ZonesMixin, I18NMixin],
    _newState : function(options){
        var res = this._getStore();
        var zones = res.getFilterZones();
        return { zones : zones };
    },
    _getStore : function(){
        return this.props.app.res;
    },
    render : function() {
        return this._renderZoneList(this.state.zones);
    }
});
