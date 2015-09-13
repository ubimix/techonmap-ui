var _ = require('underscore');
var React = require('react');

var InputWidget = React.createClass({
    
    displayName : 'InputWidget',

    getInitialState : function() {
        return this._getUpdatedState(this.props);
    },
    
    componentWillReceiveProps : function(props){
        var state = this._getUpdatedState(props);
        this.setState(state);
    },

    setFocus : function(focused, idx){
        idx = idx || 0;
        var key = this._getInputKey(idx);
        var input = this.refs[key];
        if (input) {
            var node = input.getDOMNode();
            if (focused) {
                node.focus();
            } else {
                node.blur();
            }
        }
    },
        
    render : function() {
        var className = 'form-group';
        var messageBlock = null;
        if (!!this.props.error) {
            className = 'form-group has-error';
            messageBlock = <div className="alert alert-warning" key="msg">
                {this.props.error}
            </div>;
        }
        var mandatoryMarker = '';
        if (this.props.mandatory) {
            className += ' mandatory';
            mandatoryMarker = this._renderMandatoryFieldMarker();
        }
        var key = this._getFieldKey();
        var id = key;
        var label = this.props.label;

        if (this.props.type == 'hidden') {
            return (
               <div>
                   {this._renderInputs()}
               </div>
            );
        }
        
        return (
            <div className={className} key={key} placeholder={label}>
                <label htmlFor={id} className="col-sm-4 control-label" key="left">
                    {label}
                </label>
                <div className="col-sm-8" key="right">
                    {mandatoryMarker}
                    {this._renderInputs()}
                    {messageBlock}
                </div>
            </div>        
        );
    },

    _getUpdatedState : function(props) {
        var values = props.values || [];
        values = this._validateValues(values);
        values = this._toArray(values, []);
        return this._newState({
            values : values
        });
    },

    _newState : function(options) {
        return _.extend({}, this.state, options);
    },

    _setValue : function(idx, value){
        var values = this.state.values;
        var newValues = [];
        var i;
        for (i=0; i<values.length; i++) {
            newValues[i] = values[i];  
        }
        for (; i<=idx; i++) {
            newValues.push(undefined);
        }
        newValues[idx] = value;
        newValues = this._validateValues(newValues);
        this.setState(this._newState({
            values: newValues
        }));
        if (this.props.onChange) {
            this.props.onChange(newValues);
        }
    },
    
    _renderMandatoryFieldMarker : function(){
        return <i className="icon icon-star mandatory">*</i>;
    },
    
    _toArray : function(values, defaultValue) {
        if (!values)
            return defaultValue;
        if (_.isArray(values)) 
            return values;
        return [values];
    },
    
    _renderInputs : function(){
         var fieldsNumber = this.props.fieldsNumber || 1;
         var inputs = [];
         var values = this.state.values;
         var addons = this._toArray(this.props.addons, [undefined]);
         for (var i = 0; i < fieldsNumber; i++) {
             var value = i < values.length ? values[i] : undefined;
             var addon = addons[i % addons.length];
             var input = this._renderInput(i, value, addon);
             inputs.push(input);
         }
         return inputs;
     },

     _getFieldKey: function(){
         var key = this.props.fieldKey;
         if (!key) {
             key = this._key = this._key || _.uniqueId('field-');
         }
         return key;
     },

     _getInputKey : function(idx) {
         var fieldKey = this._getFieldKey();
         return fieldKey + '-' + idx;   
     },
     
     _renderInput : function(idx, value, addon){
         idx = idx || 0;
         var key = this._getInputKey(idx);
         var addonLabel;
         var readonly = this.props.readonly;
         var className = "";
         if (!!addon) {
             addonLabel = <span className="input-group-addon">{addon}</span>;
             className = "input-group";
         }  
         var onChange = function(ev) {
             var val = ev.target.value;
             that._setValue(idx, val);
             ev.preventDefault();
             ev.stopPropagation();
         };
         var $input = this.props.type || "input";
         var type = "text";
         var $children;
         var label;
         if ($input == "select") {
             $children = _.map(this.props.options, function(label, value){
                 return (<option value={value}>{label}</option>);
             });
         } else if ($input == "email" || $input == "text") {
             type = $input;
             $input = "input";
         } else if ($input == "hidden") {
             $input = "input";
             type = "hidden";
             label = <span className="form-control">{value}</span>;
             return (
               <$input ref={key} key={key} value={value}
                     type={type}></$input>             
             );
         }
         var that = this;
         return (
             <div className={className}>
                 {addonLabel}
                 <$input ref={key} key={key} value={value}
                     className="form-control"
                     type={type}
                     placeholder={this.props.placeholder}
                     onChange={onChange}
                     selected={this.props.selected}
                 >{$children}</$input>
                 {label} 
             </div>
         ); 
     },
     
     _validateValues : function(values) {
         if (this.props.validate) {
             var newValues = this.props.validate(values);
             return newValues || values;
         } else {
             return values;
         }
     }
});


module.exports = InputWidget;