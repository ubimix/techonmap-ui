var _ = require('underscore');
var React = require('react');
var DomUtils = require('./utils/DomUtils');
var I18NMixin = require('./utils/I18NMixin');
var Teleport = require('mosaic-teleport');
var Formats = require('./utils/Formats');

module.exports = React.createClass({

    render : function(){
                return ( 
                        <div className="social">
                            {this._renderLogoutButton()}
                            <div className="pull-right follow">
                                <a href="https://twitter.com/TechOnMap" target="_blank">
                                    Suivez-nous
                                </a>
                            </div>
                            {this._renderLastTweet()}
                        </div>
                    );  
            
    },
    
    logout : function() {
        var app = this.props.app;
        var that = this;
        app.user.logout().then(function(obj){
        	that.setState({user : null});  
         });
    },
    
    getInitialState : function() {
        return { user : null };
    },
    
    componentWillMount : function() {
        this._checkUserState();
        var that = this;
        var app = this.props.app;
        var siteUrl = app.options.siteUrl;
        var client = Teleport.HttpClient.newInstance({
            baseUrl : siteUrl + 'api/twitter/last'
        });

        return client.exec({
            path : '',
            method : 'GET'
        }).then(function(json) {
            try {
                var tweet = _.isObject(json) ? json : JSON.parse(json);
                that.setState({tweet : tweet});  
                return tweet;
            } catch (err) {
                return;
            }
        });
    },
    
    componentWillUnmount : function() {
        var app = this.props.app;
        app.user.removeChangeListener(this._onUserChange);
    },
    
    _checkUserState : function() {
        var app = this.props.app;
        var that = this;
        app.user.addChangeListener(this._onUserChange);
        app.user.loadUserInfo().then(function(user) {
          that.setState({user : user});  
        });        
    },

    _renderLogoutButton : function() {
        if (!this.state.user) {
            return;
        }
        
        return (
            <div className="pull-right logout">
                <a href="#" onClick={this.logout}>
                    Se déconnecter
                </a>
            </div>
        );
    },
    
    
    _renderLastTweet : function() {
        var tweet = this.state.tweet; 
        if (!tweet)
            return;
        
        var msg = {__html: '&nbsp;'+Formats._linkifyTwitterStatus(tweet.text)};
        var user = tweet.user ? tweet.user.screen_name : '';
        var id = this.state.tweet.id_str;
        var url = 'https://twitter.com/' + user + '/status/' + id;
        var date = Formats._parseTwitterDate(tweet.created_at);
        
        return (
        <div className="left">
            <a href="https://twitter.com/TechOnMap" className="lastTweetAuthor">
                @TechOnMap
            </a> :
            <span className="lastTweet" dangerouslySetInnerHTML={msg} />
            &nbsp;–&nbsp;<a href={url} className="lastTweetDate">{date}</a>
        </div>
        )
        
    },
    
    
    _onUserChange : function() {
        this._checkUserState();
    }
});
