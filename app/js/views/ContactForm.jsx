  /** @jsx React.DOM */
var Formsy = require('formsy-react');
var PopupPanel = require('mosaic-core').React.PopupPanel;
var React = require('react');

var MyOwnInput = React.createClass({
    mixins: [Formsy.Mixin],
    
    changeValue: function (event) {
      this.setValue(event.currentTarget.value);
    },
    render: function () {
      var className = this.showRequired() ?//
              'required' : //
               (this.showError() ? 'error' : null);
      var errorMessage = this.getErrorMessage();
      return (
        <div className={className}>
          <input type="text" onChange={this.changeValue} value={this.getValue()}/>
          <span>{errorMessage}</span>
        </div>
      );
    }
});

var ContactForm = React.createClass({

    getInitialState : function(){
        return {
            canSubmit: false
        };
    },
    doSubmit: function () {
    },
    enableButton: function () {
        this.setState({
            canSubmit: true
        });
    },
    disableButton: function () {
        this.setState({
            canSubmit: false
        });
    },
    render: function () {
      return (
          <Formsy.Form onSuccess={this.doSubmit} onValid={this.enableButton} onInvalid={this.disableButton}>
              <MyOwnInput name="email" validations="isEmail" validationError="This is not a valid email" required/>
              <button type="submit" onClick={this.doSubmit} disabled={!this.state.canSubmit}>Submit</button>
          </Formsy.Form>
      );
    }
});

module.exports = ContactForm; 
