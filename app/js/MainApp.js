require('../css/index.less');

var _ = require('underscore');
var React = require('react');
var Mosaic = require('mosaic-commons');
var App = require('mosaic-core').App;
var ViewManager = require('mosaic-core').Core.ViewManager;
var MainViewFactory = React.createFactory(require('./views/MainView.jsx'));

// var SelectionModule = require('./models/selection/Selection.Module');
// var SearchModule = require('./models/search/Search.Module');
var ContentModule = require('./models/content/Content.Module');
var ContactModule = require('./models/contact/Contact.Module');
var I18NModule = require('./models/i18n/I18N.Module');
var MapModule = require('./models/map/Map.Module');
var NavigationModule = require('./models/nav/Navigation.Module');
var Navigation = require('./models/nav/Navigation');
var ResourceModule = require('./models/res/Resource.Module');
var EditModule = require('./models/edit/Edit.Module');
var StatsModule = require('./models/stats/Stats.Module');
var SerializeModule = require('./models/serialize/Serialize.Module');
var UIModule = require('./models/ui/UI.Module');
var UserModule = require('./models/user/User.Module');

var initWidgets = require('./views/widgets/registration');
module.exports = App.extend({

    /**
     * This function loads and initializes all modules of this application.
     */
    initModules : function() {
        this.state = new Navigation();
        this.viewManager = new ViewManager();
        initWidgets(this);
        var modules = {
            user : UserModule,
            content : ContentModule,
            contact : ContactModule,
            edit : EditModule,
            map : MapModule,
            res : ResourceModule,
            stats : StatsModule,
            serialize : SerializeModule,
            // search : SearchModule,
            // selection : SelectionModule,
            i18n : I18NModule,
            ui : UIModule,
            nav : NavigationModule,
        };
        this.apis = [];
        this.modules = {};
        var options = this.options;
        _.each(modules, function(ModuleType, name) {
            var module = new ModuleType(_.extend({}, options, {
                key : name,
                app : this
            }));
            this._addModule(name, module);
        }, this);
    },

    /** Returns all registered modules. */
    getModules : function() {
        return this.modules;
    },

    _addModule : function(name, module) {
        var api = module.api;
        this.apis.push(api);
        this.modules[name] = module;
        this[name] = api;
    },

    _applyToModules : function(modules, onoff) {
        var that = this;
        var promise = Mosaic.P();
        _.each(modules, function(module) {
            promise = promise.then(function() {
                if (module[onoff]) {
                    return module[onoff]();
                }
            })
        });
        return promise;

        return Mosaic.P.all(_.map(modules, function(module) {
            return Mosaic.P.then(function() {
                if (module[onoff]) {
                    return module[onoff]();
                }
            })
        }));
    },

    /**
     * Pre-loads data for this application and returns a promise with results.
     */
    preloadData : function() {
        return this._applyToModules(this.modules, 'start');
    },

    /** Closes all modules */
    deleteModules : function() {
        return this._applyToModules(this.modules, 'stop');
    },

    /**
     * This method initializes main views of this application.
     */
    initViews : function(err) {
        if (err) {
            console.log('[ERROR] Initialization failed.', err);
        }
        var containers = this.options.containers;
        this.mainView = MainViewFactory({
            app : this
        });
        React.render(this.mainView, containers.main);
    }

});
