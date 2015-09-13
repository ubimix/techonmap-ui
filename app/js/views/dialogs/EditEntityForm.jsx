'use strict';
var _ = require('underscore');
var React = require('react');
var Mosaic = require('mosaic-commons');
var I18NMixin = require('../utils/I18NMixin');
var DomUtils = require('../utils/DomUtils');
var FormReactField = require('../utils/FormReactField');
var GeolocationWidget = require('./GeolocationWidget.jsx');
var InputWidget = require('./InputWidget.jsx');
var InputWidgetFactory = React.createFactory(InputWidget);
require('../../../css/select.less');
var Select = require('react-select');

module.exports = React.createClass({

    displayName : 'EditEntityForm',
    mixins: [I18NMixin],
    
    getApp: function(){
        return this.props.app;
    },
    componentDidMount  : function(){
        setTimeout(function(){
            var nameInput = this.refs['properties.name'];
            if (nameInput) {
                nameInput.setFocus(true);
            }
        }.bind(this), 300);
    },
    componentWillMount : function(){
        this.props.app.edit.addChangeListener(this._redraw);
    },
    componentWillUnmount :function(){
        this.props.app.edit.removeChangeListener(this._redraw);
    },
    getInitialState : function(){
          return this._newState();
    },
    _redraw : function(){
        if (!this.isMounted())
            return ;
        this.setState(this._newState());
    },
    _newState : function(){
        return {
            refs : {}
        };
    },
    componentWillReceiveProps : function(){
    },
    _getFieldRef : function(fieldKey) {
        var counter = this.state.refs[fieldKey] || 0;
        this.state.refs[fieldKey] = counter + 1;
        return fieldKey + '-' + counter;
    },
    _renderHorizontalFormGroup : function(name, labelKey, input, optional){
        var id = input.props.id;
        var errorMsg = this._getFieldError(name);
        var className = 'form-group';
        var messageBlock = null;
        if (!!errorMsg) {
            className = 'form-group has-error';
            messageBlock = (
                <div className="alert alert-warning" key={labelKey + '-errorMsg'}>{errorMsg}</div>
            );
        }
        var mandatoryMarker = '';
        if (!optional) {
            className += ' mandatory';
            mandatoryMarker = <i className="icon icon-star mandatory" key="marker">*</i>;
        }
        return (
            <div className={className} key={labelKey}>
                <label htmlFor={id} className="col-sm-4 control-label" key="left">
                    {this._getLabel(labelKey)}
                </label>
                <div className="col-sm-8" key="right">
                    {mandatoryMarker}
                    {input}
                    {messageBlock}
                </div>
            </div>
        );
    },

    _isNewResource : function(){
        return this.props.app.edit.isNewResource();
    },

    _newId : function(){
        return _.uniqueId('field-');
    },

    _onFieldUpdate : function(fieldKey) {
        var values = [];
        _.each(this.refs, function(field) {
            var elm = field.getDOMNode();
            var name = elm.getAttribute('name');
            if (!name) {
                elm = elm.querySelector('[name]');
                if (!elm)
                    return ;
                name = elm.getAttribute('name');
            }
            if (name == fieldKey) {
                var value = elm.value;
                if (value) {
                    values.push(value);
                }
            }
        });
        var fields = {};
        fields[fieldKey] = values;
        this.props.app.edit.updateFields(fields);
    },
    _getFieldError : function(fieldKey) {
        return this.props.app.edit.getFieldError(fieldKey);
    },
    _getResourceField : function(fieldKey) {
        var value = this.props.app.edit.getResourceValue(fieldKey);
        return value || '';
    },
    _getInputOptions : function(fieldKey, labelKey, options){
        var fieldRef = this._getFieldRef(fieldKey);
        options = options || {};
        var that = this;
        options = _.extend({
            className: 'form-control',
            placeholder: labelKey ? this._getLabel(labelKey) : undefined,
            // id: this._newId(),
            name: fieldKey,
            ref : fieldRef,
            key : fieldRef,
            type : 'text',
            value : this._getResourceField(fieldKey)
        }, options);
        return options;
    },

    _renderInputGroup : function(options) {
        var label = options.labelKey ? this._getLabel(options.labelKey) : undefined;
        var placeholder = options.placeholderKey ? this._getLabel(options.placeholderKey) : undefined;
        var values = this._getResourceField(options.fieldKey);
        var error = this._getFieldError(options.fieldKey);
        return new InputWidgetFactory(_.extend({}, options, {
            label : label,
            values : values,
            placeholder : placeholder,
            error: error,
            onChange: function(values){
                var fields = {};
                fields[options.fieldKey] = values;
                this.props.app.edit.updateFields(fields);
// if (options.fieldKey && options.fieldKey === 'properties.category')
// this._renderTags();
            }.bind(this)            
        }));
    },

    _renderName : function(){
        return this._renderInputGroup({
            mandatory : true,
            ref : 'properties.name',
            fieldKey : 'properties.name',
            labelKey : 'dialog.edit.name.label',
            placeholderKey : 'dialog.edit.name.placeholder',
        });
    },

    _renderId : function(){
        var newEntity = this._isNewResource();
        return this._renderInputGroup({
            mandatory : true,
            type : newEntity ? 'text' : 'hidden', 
            addons : 'techonmap.fr/#',
            fieldKey : 'properties.id',
            labelKey : 'dialog.edit.id.label',
            placeholderKey : 'dialog.edit.id.placeholder'
        });
    },
    
    _renderMail : function(){
        var mandatory = this._isNewResource();
        return this._renderInputGroup({
            mandatory : mandatory,
            type : 'email',
            fieldKey : 'properties.email',
            labelKey : 'dialog.edit.email.label',
            placeholderKey :  'dialog.edit.email.placeholder',
        });
    },
    _renderDescription : function(){
        return this._renderInputGroup({
            mandatory : true,
            type : 'textarea',
            fieldKey : 'properties.description',
            labelKey : 'dialog.edit.description.label',
            placeholderKey :  'dialog.edit.description.placeholder',
        });
    },
    _renderCategories : function(){
        var app = this.props.app;
        var categoryKey = app.edit.getResourceValue('properties.category');
        var categoryOptions = {'' :''};
        var categories = app.res.getCategories();
        _.each(categories, function(category) {
            categoryOptions[category.key] = category.label;
        });
        return this._renderInputGroup({
            type : 'select',
            options : categoryOptions,
            selected : categoryKey, 
            mandatory : true,
            fieldKey : 'properties.category',
            labelKey : 'dialog.edit.category.label',
        });
    },
    
    _renderTags : function(){
        var app = this.props.app;
        var categoryKey = app.edit.getResourceValue('properties.category');
        var fieldKey = 'properties.tags';
        var resourceTags = app.edit.getResourceValue(fieldKey) || [];
        var tagsIndex = {};
        var tags = _.map(resourceTags, function(tag) {
            tagsIndex[tag] = true;
            return toTagObject(tag);
        });
        
        function toTagObject(val) {
            var suffix = '';
            return {
                tag : val,
                value : val + suffix,
                label : val + suffix,
            };
        }
        
        var that = this;
        function onTagChange(val, list) {
            var fields = {};
            var values = fields[fieldKey] = [];
            _.each(list, function(obj){
                values.push(obj.tag);
            });
            that.props.app.edit.updateFields(fields);
            setTimeout(function(){
                var select = that.refs.tagSelector;
                select.setState({isOpen: false});
            }, 10);
        }
        var getOptions = function(input, callback) {
            setTimeout(function() {
                var tagsList = app.res.getTagsSuggestion(categoryKey, input);
                var alreadySuggested = false;
                var suggestions = _.filter(tagsList, function(tag) {
                    alreadySuggested |= tag == input;
                    return !_.has(tagsIndex, tag);
                });
                suggestions = _.map(suggestions, toTagObject);
                if (!!input && !alreadySuggested && !_.has(tagsIndex, input)) {
                    var label = that._getLabel('dialog.edit.tag.newTagSuggestion');
                    var newTag = (
                        <span key={label}>
                            <strong>{input}</strong>
                            &nbsp;{label}
                        </span>
                    );
                    var tagObj = toTagObject(input);
                    tagObj.created = true;
                    tagObj.label = newTag;
                    suggestions.unshift(tagObj);
                }
                callback(null, {
                    options: suggestions,
                    complete: false
                });
            }, 10);
        };
        
        var tagsList = app.res.getTagsSuggestion(categoryKey);
        var suggestions = _.map(tagsList, toTagObject);
        
        var tagSelector = <Select
            ref="tagSelector"
            key="tagSelector"
            name={fieldKey}
            value={tags}
            options={suggestions}
            asyncOptions={getOptions}
            multi={true}
            onChange={onTagChange}
            matchPos={'start'}
            filterOption={function(option, filter) { return true;}}
            isFocused={false}
            placeholder={this._getLabel('dialog.edit.tag.placeholder')}
            searchPromptText={this._getLabel('dialog.edit.tag.prompt')}
            noResultsText={this._getLabel('dialog.edit.tag.noResults')}
            clearValueText={this._getLabel('dialog.edit.tag.clear')}
            clearAllText={this._getLabel('dialog.edit.tag.clearAll')}
        />;

        return this._renderHorizontalFormGroup(fieldKey, 'dialog.edit.tag.label', tagSelector);
    },
    _renderCategoriesAndTags : function(){
        var components = [];
        var app = this.props.app;
        components.push(this._renderCategories());
        components.push(this._renderTags());
        return components;
    },
    
    _renderAddressAndCoordinates : function(){
        var app = this.props.app;
        var mapOptions = app.map.getMapOptions();
        var zoom = mapOptions.zoom || 17;
        var tilesUrl = mapOptions.tilesUrl;
        var type = this._getResourceField('properties.category') || 'Entreprise';
        var marker = app.viewManager.newView('mapMarker', type, {
            app : app,
            type : type,
            params : {
                draggable : true
            }
        });
        var coords = this._getResourceField('geometry.coordinates');
        if (!coords || !coords[0] || !coords[1])  {
            coords = undefined; // [undefined, undefined]; // mapOptions.center || [ 0, 0 ];
        } else {
            zoom = 16;
        }
        var bbox = mapOptions.bbox || [ [2, 50], [3, 48] ];
        this._addressInfo = this._addressInfo || {};
        _.extend(this._addressInfo, {
            bbox : bbox,
            address : {
                name : 'properties.address',
                placeholder  : this._getLabel('dialog.edit.address.placeholder'),
                value: this._getResourceField('properties.address'),
                error : this._getFieldError('properties.address')
            },
            postcode: {
                name : 'properties.postcode',
                placeholder  : this._getLabel('dialog.edit.postcode.placeholder'),
                value: this._getResourceField('properties.postcode'),
                error : this._getFieldError('properties.postcode')
            },
            city : {
                name : 'properties.city',
                placeholder  : this._getLabel('dialog.edit.city.placeholder'),
                value: this._getResourceField('properties.city'),
                error : this._getFieldError('properties.city')
            },
            longitude : {
                name: 'geometry.coordinates.0',
                type: 'hidden',
                value : coords ? coords[0] : undefined,
                //error : this._getFieldError('geometry.coordinates')
            },
            latitude : {
                name: 'geometry.coordinates.1',
                type: 'hidden',
                value : coords ? coords[1] : undefined,
                error : this._getFieldError('geometry.coordinates')
            },
            localizeBtn : {
                label : this._getLabel('dialog.edit.localize.btn'),
            },
            map : {
                style : {width: '100%', height:'200px'},
            }
        });
        
        var errorMsg = this._getFieldError('geometry.coordinates');
        var edit = this.props.app.edit;
        console.log('renderAddressAndCoordinates: coords=', coords);
        return [
            this._renderHorizontalFormGroup('properties.address', 'dialog.edit.address-group.label', 
                <GeolocationWidget
                    info = {this._addressInfo}
                    tilesUrl={tilesUrl}
                    center={coords}
                    zoom={zoom}
                    marker={marker}
                    onAddressChange={function(info){
                        console.log('>>>>>>>>>', JSON.stringify(info));
                        var fields = {};
                        _.each(info, function(field) {
                            var name = field.name;
                            var value = field.value;
                            if (name) {
                                fields[name] = value ? [value] : [];
                            }
                        }, this);
                        this.props.app.edit.updateFields(fields);
                    }.bind(this)}/>),
        ];        
    },
    
    _renderCreationYear : function(){
        return this._renderInputGroup({
            mandatory : true,
            fieldKey : 'properties.creationyear',
            labelKey : 'dialog.edit.year.label',
            placeholderKey :  'dialog.edit.year.placeholder',
        });
    },
    
    _renderSiret : function(){
        return this._renderInputGroup({
            fieldKey : 'properties.taxID',
            labelKey : 'dialog.edit.siret.label',
            placeholderKey : 'dialog.edit.siret.placeholder',
        });
    },
    
    _renderWebSiteUrl : function(){
        return this._renderInputGroup({
            mandatory : true,
            fieldKey : 'properties.url',
            labelKey : 'dialog.edit.url.label', 
            placeholderKey :  'dialog.edit.url.placeholder',
        });        
    },
    
    _renderTwitterAccount : function(){
        return this._renderInputGroup({
            addons : '@' ,
            fieldKey : 'properties.twitter',
            labelKey : 'dialog.edit.twitter.label', 
            placeholderKey :  'dialog.edit.twitter.placeholder',
        });        
    }, 
    
    _renderFacebookAccount : function(){
        return this._renderInputGroup({
            fieldKey : 'properties.facebook',
            labelKey : 'dialog.edit.facebook.label', 
            placeholderKey :  'dialog.edit.facebook.placeholder',
        });        
    }, 
    
    _renderLinkedInAccount : function(){
        return this._renderInputGroup({
            fieldKey : 'properties.linkedin',
            labelKey : 'dialog.edit.linkedin.label', 
            placeholderKey :  'dialog.edit.linkedin.placeholder',
        });
    },
    
    _renderGooglePlusAccount : function(){
        return this._renderInputGroup({
            fieldKey : 'properties.googleplus',
            labelKey : 'dialog.edit.googleplus.label', 
            placeholderKey :  'dialog.edit.googleplus.placeholder',
        });
    },
    
    _renderViadeoAccount : function(){
        return this._renderInputGroup({
            fieldKey : 'properties.viadeo',
            labelKey : 'dialog.edit.viadeo.label', 
            placeholderKey :  'dialog.edit.viadeo.placeholder',
        });
    },
 
    render : function(){
        return (
        <form className="form-horizontal edit">
            <section>
                {this._renderName()}
                {this._renderId()}
                {this._renderSiret()}
                {this._renderCategoriesAndTags()}
                {this._renderDescription()}
                {this._renderCreationYear()}
            </section>
            
            <h2>{this._getLabel('dialog.edit.contacts.title')}</h2>
            <section>
                {this._renderMail()}
                {this._renderWebSiteUrl()}
                {this._renderAddressAndCoordinates()}
            </section>
            
            <h2>{this._getLabel('dialog.edit.sn.title')}</h2>
            <section>
                {this._renderTwitterAccount()}
                {this._renderFacebookAccount()}
                {this._renderGooglePlusAccount()}
                {this._renderLinkedInAccount()}
                {this._renderViadeoAccount()}
            </section>
        </form>
        );
    }
    
});
