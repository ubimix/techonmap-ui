var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var ResourceUtils = require('../../tools/ResourceUtilsMixin');
var LunrWrapper = require('../../tools/LunrWrapper');
var ResourceFieldsAccessor = require('../../tools/ResourceFieldsAccessor');

var App = require('mosaic-core').App;
var Api = App.Api;
var AppStateMixin = require('../AppStateMixin');

/** This module is responsible for management of resources. */
module.exports = Api.extend({}, ResourceUtils, AppStateMixin, {

    /** Initializes fields */
    _initFields : function() {
        this._criteria = {};
        // Search criteria
        this._categories = [];
        this._zones = [];

        this._fields = {
            fields : {}
        };
        this._resources = [];
        this._allResources = {};
        this._selectedResource = null;
        this._sort = {
            sortBy : 'name',
            direct : true
        };
    },

    /**
     * Returns the parent application.
     */
    getApp : function() {
        return this.options.app;
    },

    // ------------------------------------------------------------------

    /** Pre-loads map-related information. */
    start : function() {
        var that = this;
        var app = this.options.app;
        app.edit.addEndEditListener(this._onEndEdit, this);
        this
                .addSearchCriteriaChangeListener(this._onSearchCriteriaChange,
                        this);
        this._allResourcesPromise = this._loadAllInfo();
        // this._deferrredSelectResource = _.debounce(this.selectResource, 100);
        // this._onAppStateChange = _.debounce(this._onAppStateChange, 1);
        this._startPromise = this._searchResources().then(function() {
            var state = that.getAppState();
            state.addChangeListener(that._onAppStateChange, that);
        });
        return this._startPromise;
    },

    stop : function() {
        this.removeSearchCriteriaChangeListener(this._onSearchCriteriaChange,
                this);
        var app = this.options.app;
        app.edit.removeEndEditListener(this._onEndEdit, this);
        var state = this.getAppState();
        state.removeChangeListener(this._onAppStateChange, this);
    },

    _onSearchCriteriaChange : function() {
        return this._searchResources();
    },

    _onEndEdit : function(evt) {
        var that = this;
        if (!evt.changed)
            return;
        var resource = evt.resource;
        var resourceId = that.getResourceId(resource);
        return Mosaic.P.then(function() {
            return that._trace('_onEndEdit', function() {
                that._allResources[resourceId] = resource;
                that._resetResources();
                that._indexResource(resourceId, resource);
            });
        }).then(function() {
            return that._searchResources();
        }).then(function() {
            return that.selectResource({
                resourceId : resourceId
            });
        });
    },

    _onAppStateChange : function(ev) {
        this._startPromise.then(function() {
            var app = this.options.app;
            var path = ev.path;
            var updated = false;
            var criteria = this._getAppState('search');
            if (criteria) {
                this.updateSearchCriteria(criteria);
            }
            // var sort = this._getAppState('sort');
            // if (sort) {
            // this.sortResources(sort);
            // }
            var resourceId = this._getAppState('selectedId');
            if (resourceId) {
                setTimeout(function() {
                    this.selectResource({
                        resourceId : resourceId,
                        force : false
                    });
                }.bind(this), 100);
            }
        }.bind(this));
    },

    // ------------------------------------------------------------------
    // Actions

    _doSelectResource : function(resourceId, force) {
        var promise = this._selectionPromise;
        if (!promise) {
            promise = Mosaic.P();
        }
        var that = this;
        this._selectionPromise = promise.then(function() {
            var prevId = that.getSelectedResourceId();
            var updated = resourceId !== prevId;
            if (!updated && force) {
                resourceId = null;
                updated = true;
            }
            return that._findResourceById(resourceId).then(function(resource) {
                if (updated) {
                    that._selectedResource = resource;
                    that._updateAppState('selectedId', resourceId);
                    that.notifySelection();
                }
                return updated;
            });
        });
        return this._selectionPromise;
    },

    /**
     * Selects a resource by an identifier and sets it in the store. Notifies
     * about the selected resource.
     */
    selectResource : Api.intent(function(intent) {
        var that = this;
        var resourceId = intent.params.resourceId;
        var force = intent.params.force !== false;
        return intent.resolve(Mosaic.P.then(function() {
            return that._doSelectResource(resourceId, force);
        }));
    }),

    /** Sort resources by name or by modification date. */
    sortResources : Api.intent(function(intent) {
        var that = this;
        return intent.resolve(Mosaic.P.then(function() {
            var updated = that._setSortResources(intent.params);
            that._sortResults();
            return updated;
        })).then(function(updated) {
            if (updated) {
                that.notify();
            }
        });
    }),

    _setSortResources : function(params) {
        var that = this;
        var val = {
            sortBy : params.sortBy,
            direct : !!params.direct
        };
        var updated = !_.isEqual(that._sort, val);
        that._sort = val;
        if (updated) {
            that._updateAppState('sort', that._sort);
        }
        return updated;
    },

    sortResourcesByName : function(direct) {
        return this.sortResources({
            sortBy : 'name',
            direct : !!direct
        });
    },

    sortResourcesByDate : function(direct) {
        return this.sortResources({
            sortBy : 'date',
            direct : !!direct
        });
    },

    getSortByName : function() {
        if (this._sort.sortBy != 'name')
            return 0;
        return this._sort.direct ? 1 : -1;
    },

    getSortByDate : function() {
        if (this._sort.sortBy != 'date')
            return 0;
        return this._sort.direct ? 1 : -1;
    },

    /** Updates an internal search criteria */
    updateSearchCriteria : Api.intent(function(intent) {
        var that = this;
        return intent.resolve(Mosaic.P.then(function() {
            return that._setSearchCriteria(intent.params);
        })).then(function(updated) {
            if (updated) {
                that.notifySearchCriteria();
            }
        });
    }),

    _setSearchCriteria : function(criteria) {
        var that = this;
        criteria = criteria || {};
        var newCriteria = _.extend({}, that._criteria, criteria);
        var updated = !_.isEqual(that._criteria, newCriteria);
        that._criteria = newCriteria;
        if (updated) {
            that._updateAppState('search', that._criteria);
        }
        return updated;
    },

    // ------------------------------------------------------------------

    /** Returns the number of currently found results. */
    getResourceNumber : function() {
        return this._resources.length;
    },

    getResourceType : function(resource) {
        return ResourceUtils.getResourceType(resource);
    },

    /** Returns the total resource number. */
    getTotalResourceNumber : function() {
        var keys = _.keys(this._allResources);
        return keys.length;
    },

    /** Returns a list of all loaded resources. */
    getAllResources : function() {
        return _.values(this._allResources);
    },

    getAllResourceIndex : function() {
        return this._allResources
    },

    /** Returns a list of all resources. */
    getResources : function() {
        return this._resources;
    },

    /** Returns a list of all resources. */
    getResourcePosition : function(id) {
        var result = -1;
        _.find(this._resources, function(r, idx) {
            var resourceId = this.getResourceId(r);
            if (id == resourceId) {
                result = idx;
                return true;
            }
            return false;
        }, this);
        return result;
    },

    /** Returns the currently selected resource */
    getSelectedResource : function() {
        return this._selectedResource;
    },

    /**
     * Returns <code>true</code> if a resource with the specified identifier
     * is selected.
     */
    isSelectedResource : function(id) {
        return id == this.getSelectedResourceId();
    },

    /**
     * Returns the identifier of the selected resource or <code>null</code> if
     * not resources were selected.
     */
    getSelectedResourceId : function() {
        return this.getResourceId(this._selectedResource);
    },

    /**
     * Returns position of the selected resource in the list.
     */
    getSelectedResourcePos : function() {
        var result = -1;
        var selectedId = this.getSelectedResourceId();
        if (selectedId !== null) {
            _.find(this._resources, function(resource, i) {
                if (this.getResourceId(resource) === selectedId) {
                    result = i;
                    return true;
                }
                return false;
            }, this);
        }
        return result;
    },

    // ------------------------------------------------------------------

    /** Adds selection change listener */
    addSelectListener : function(listener, context) {
        this.on('select', listener, context);
    },

    /** Removes selection change listener */
    removeSelectListener : function(listener, context) {
        this.off('select', listener, context);
    },

    /** Notifies about selection changes. */
    notifySelection : function() {
        this.emit('select');
    },

    // ------------------------------------------------------------------

    /** Adds a new path change listener. */
    addSearchCriteriaChangeListener : function(listener, context) {
        this.on('search', listener, context);
    },

    /** Removes search criteria change listener. */
    removeSearchCriteriaChangeListener : function(listener, context) {
        this.off('search', listener, context);
    },

    /** Notifies about search criteria changes. */
    notifySearchCriteria : function() {
        this.emit('search');
    },

    // ------------------------------------------------------------------

    getTagsSuggestion : function(categoryKey, mask) {
        var tagsList;
        var len = !!mask ? mask.length : 0;
        var categoryTags = this.getCategoryTags(categoryKey);
        if (len || !categoryTags.length) {
            tagsList = this.getAllTags();
        } else {
            tagsList = categoryTags;
        }
        var tags;
        if (!mask) {
            tags = tagsList;
        } else {
            mask = ResourceUtils.normalizeName(mask);
            var regexp = new RegExp('(^' + mask + '|\\b' + mask + ')');
            tags = [];
            _.each(tagsList, function(str) {
                var s = ResourceUtils.normalizeName(str);
                if (regexp.test(s)) {
                    tags.push(str);
                }
            });
        }
        return tags;
    },

    /** Returns a list of all tags. */
    getAllTags : function() {
        if (!this._allTags) {
            this._allTags = {};
            _.each(this._categories, function(category) {
                var tags = (category && category.tags) || [];
                _.each(tags, function(tag) {
                    tag = this._normalizeTag(tag);
                    this._allTags[tag] = (this._allTags[tag] || 0) + 1;
                }, this);
            }, this);
            _.each(this._allResources, function(resource, key) {
                var tags = this.getResourceTags(resource);
                _.each(tags, function(tag) {
                    tag = this._normalizeTag(tag);
                    this._allTags[tag] = (this._allTags[tag] || 0) + 1;
                }, this);
            }, this);
        }
        var result = _.map(this._allTags, function(value, key) {
            return key;
        }).sort();
        return result;
    },

    _normalizeTag : function(tag) {
        tag = tag || '';
        return tag.toLowerCase();
    },

    // ------------------------------------------------------------------

    /** Returns all categories for this application. */
    getCategories : function() {
        return this._categories;
    },

    /** Returns all categories for this application. */
    getCategoryKeys : function() {
        return _.map(this._categories, function(category) {
            return category.key;
        });
    },

    getCategoryIcon : function(category) {
        var key = this.getCategoryKey(category);
        category = this.getCategoryByKey(key);
        var icon;
        if (category) {
            icon = category.icon;
        }
        return icon;
    },

    /**
     * Toggle tags in the search criteria. This methods sets all new tags and
     * removes already existing tags from the specified tag array.
     */
    toggleCategories : function(categories) {
        categories = _.map(categories, this.getCategoryKey, this);
        var criteria = this.getSearchCriteria();
        criteria = this._toggleSearchCriteriaObject(criteria, 'category',
                categories);
        criteria.tags = [];
        return this.updateSearchCriteria(criteria);
    },

    /** Returns an array of categories used as a search criteria. */
    getFilterCategories : function() {
        var keys = this.getFilterCategoryKeys();
        return _.map(keys, function(key) {
            return this.getCategoryByKey(key);
        }, this);
    },

    /** Returns a category used to filter object. */
    getFilterCategory : function() {
        var categories = this.getFilterCategories();
        return categories.length ? categories[0] : null;
    },

    /**
     * Returns <code>true</code> if there are filtering criteria.
     */
    hasFilterCategories : function() {
        var categories = this.getFilterCategories();
        return !!categories.length;
    },

    /** Returns a list of category keys used to filter objects. */
    getFilterCategoryKeys : function() {
        var criteria = this.getSearchCriteria();
        return this._toArray(criteria.category);
    },

    /** Returns a category object corresponding to the specified key. */
    getCategoryByKey : function(key) {
        if (!key)
            return null;
        var criteria = this.prepareFilterValues(key);
        var result = _.find(this._categories, function(category) {
            var key = this.getCategoryKey(category);
            var keys = this.prepareFilterValues(key);
            return this.filterValues(criteria, keys);
        }, this);
        return result;
    },

    /**
     * Returns <code>true</code> if the specified category is selected (it is
     * present in the search criteria).
     */
    isFilteredByCategory : function(category) {
        var criteria = this.prepareFilterValues(this.getFilterCategoryKeys());
        var key = this.getCategoryKey(category);
        var categories = this.prepareFilterValues(key);
        return this.filterValues(criteria, categories);
    },

    /**
     * Returns <code>true</code> if the current search criteria applies a
     * category filter.
     */
    hasCategoryFilteredApplied : function() {
        var keys = this.getFilterCategoryKeys();
        return keys && keys.length > 0;
    },

    /** Returns the key of the specified category. */
    getCategoryKey : function(category) {
        var key = _.isObject(category) ? category.key : category;
        return key;
    },

    /** Returns tags associated with the specified category. */
    getCategoryTags : function(category) {
        var key = this.getCategoryKey(category);
        var category = this.getCategoryByKey(key);
        var tags = (category && category.tags) || [];
        return this.prepareFilterValues(tags);
    },

    _toggleSearchCriteriaObject : function(criteria, key, values) {
        var existing = criteria[key];
        existing = this.prepareFilterValues(existing);
        values = this.prepareFilterValues(values);
        if (existing[0] === values[0]) {
            values = [];
        }
        var options = {};
        options[key] = values;
        if (!_.isArray(existing) && _.isObject(existing)) {
            options = _.extend({}, existing, options);
        }
        return options;
    },

    _toggleSearchCriteria : function(key, values) {
        var criteria = this.getSearchCriteria();
        criteria = this._toggleSearchCriteriaObject(criteria, key, values);
        return this.updateSearchCriteria(criteria);
    },
    // ------------------------------------------------------------------

    /** Returns all geographic zones for this application. */
    getZones : function() {
        return this._toArray(this._zones);
    },

    /** Returns true if there are geographical filters applied */
    hasZonesFilter : function() {
        var keys = this.getFilterZoneKeys();
        return !!keys.length;
    },

    /** Toggles geographic zones. */
    toggleZones : function(zones) {
        zones = _.map(zones, this.getZoneKey, this);
        return this._toggleSearchCriteria('postcode', zones);
    },

    /** Returns filtering zones */
    getFilterZones : function() {
        var keys = this.getFilterZoneKeys();
        var result = _.filter(_.map(keys, function(key) {
            return this.getZoneByKey(key);
        }, this), function(val) {
            return !!val;
        });
        return result;
    },

    /** Returns a list of all zones used to fileter values. */
    getFilterZoneKeys : function() {
        var criteria = this.getSearchCriteria();
        return this._toArray(criteria.postcode);
    },

    /** Returns a zone description corresponding to the specified key. */
    getZoneByKey : function(key) {
        var criteria = this.prepareFilterValues(key);
        var result = _.find(this._zones, function(zone) {
            var key = this.getZoneKey(zone);
            var keys = this.prepareFilterValues(key);
            return this.filterValues(criteria, keys);
        }, this);
        return result;
    },

    /** Returns key of the specified zone. */
    getZoneKey : function(zone) {
        var key = _.isObject(zone) ? zone.key : zone;
        return key;
    },

    /**
     * Returns <code>true</code> if the specified zone is selected (it is
     * present in the search criteria).
     */
    isFilteredByZone : function(zone) {
        var zones = this.prepareFilterValues(this.getFilterZoneKeys());
        if (!zones.length)
            return false;
        var key = this.getZoneKey(zone);
        var value = this.prepareFilterValues(key);
        return this.filterValues(value, zones);
    },

    // ------------------------------------------------------------------

    /**
     * Toggle tags in the search criteria. This methods sets all new tags and
     * removes already existing tags from the specified tag array.
     */
    toggleTags : function(tags) {
        return this._toggleSearchCriteria('tags', tags);
    },

    /** Returns an array of tags used as a search criteria. */
    getFilterTags : function() {
        var criteria = this.getSearchCriteria();
        return this._toArray(criteria.tags);
    },

    /**
     * Returns <code>true</code> if the specified tag is selected (it is
     * present in the search criteria).
     */
    isFilteredByTag : function(tag) {
        var criteria = this.prepareFilterValues(this.getFilterTags());
        var tags = this.prepareFilterValues(tag);
        return this.filterValues(criteria, tags);
    },

    /** Returns <code>true</code> if there are tags used in the filters. */
    hasFilterTags : function() {
        var tags = this.getFilterTags();
        return !!tags.length;
    },

    /** Returns a "normalized" tag representation */
    getTagKey : function(tag) {
        var tags = this.prepareFilterValues(tag);
        return tags.length ? tags[0] : null;
    },

    // ------------------------------------------------------------------

    /** Returns all search criteria */
    getSearchCriteria : function() {
        return this._criteria;
    },

    /** Returns currently applyed search criteria. */
    getSearchQuery : function() {
        var criteria = this.getSearchCriteria();
        return criteria.q || '';
    },

    /** Returns <code>true</code> if there is a defined full-text search query. */
    hasSearchQuery : function() {
        var query = this.getSearchQuery();
        return query && query != '';
    },

    /** Sets a new search query */
    setSearchQuery : function(value) {
        return this.updateSearchCriteria({
            q : value
        });
    },

    // ------------------------------------------------------------------

    /** Returns <code>true</code> if there are search criteria applied. */
    hasSearchCriteria : function() {
        return this.hasSearchQuery() || this.hasZonesFilter() || //
        this.hasCategoryFilteredApplied() || this.hasFilterTags();
    },

    // ------------------------------------------------------------------

    /** Returns true if the values matches to the given filters criteria. */
    filterValues : function(value, filters) {
        if (!filters || !filters.length)
            return true;
        if (!value)
            return false;
        var values = this.prepareFilterValues(value);
        var result = false;
        for (var i = 0; !result && i < values.length; i++) {
            var value = values[i];
            for (var j = 0; !result && j < filters.length; j++) {
                var filter = filters[j];
                if (_.isFunction(filter)) {
                    result = filter(value);
                } else {
                    result = filter === value;
                }
            }
        }
        return result;
    },

    /**
     * "Normalizes" the specified value for filtering. This method returns an
     * array of lower case strings used to filter resource values.
     */
    prepareFilterValues : function(value) {
        if (!value) {
            value = [];
        } else {
            var newValues = [];
            value = _.isArray(value) ? _.toArray(value) : [ value ];
            _.each(value, function(f) {
                var str = ('' + f).toLowerCase();
                var array = str.split(/\s*[,;]+\s*/gim);
                newValues = newValues.concat(array);
            });
            value = newValues;
        }
        return value;
    },

    // ------------------------------------------------------------------
    // Private methods responsible for data loading.

    /**
     * Loads all required data files from the server and initializes this store.
     */
    _loadAllInfo : function() {
        var that = this;
        return Mosaic.P.then(
                function() {
                    return Mosaic.P.all([ that._loadCategories(),
                            that._loadGeographicZones() ]);
                })//
        .then(function() {
            // return that._copySearchCriteriaFromUrl();
        }).then(function() {
            return that._loadDataMapping();
        }).then(function() {
            return that._loadResources();
        }).then(function() {
            return that._buildIndex();
        });
    },

    /**
     * Loads definitions of geographic zones used by this application
     */
    _loadGeographicZones : function() {
        var that = this;
        return Mosaic.P.then(function() {
            return that._getJson(_.extend({}, {
                path : that.options.app.options.zonesUrl
            })).then(function(zones) {
                that._zones = zones;
            });
        });
    },

    /**
     * Loads all categories used by this application
     */
    _loadCategories : function() {
        var that = this;
        return Mosaic.P.then(function() {
            return that._getJson(_.extend({}, {
                path : that.options.app.options.categoriesUrl
            })).then(function(categories) {
                that._categories = categories;
            });
        });
    },

    /**
     * Loads datamapping used to initialize field weights used to index data in
     * Lunr index
     */
    _loadDataMapping : function() {
        var that = this;
        return that._getJson(_.extend({}, {
            path : that.app.options.dataFieldsUrl
        })).then(function(fields) {
            that._fields = fields;
        });
    },

    /** Loads all resources and returns a promise for results */
    _loadResources : function(options) {
        var that = this;
        return that._getGeoJsonArray(_.extend({}, options, {
            path : that.app.options.dataUrl
        })).then(function(resources) {
            that._allResources = {};
            _.map(resources, function(d) {
                var id = that.getResourceId(d);
                that._allResources[id] = d;
            });
            that._selectedResource = null;
            that._resetResources();
        });
    },

    _getLunrIndex : function() {
        if (!this._index) {
            var index = this._index = new LunrWrapper({
                fields : this._fields.fields
            });
            var events = [ //
            'configuration:begin', 'configuration:end', //
            'indexing:begin', 'indexing:end',//
            'search:begin', 'search:end'// 
            ];
            _.each(events, function(eventType) {
                index.on(eventType, function() {
                    console.log(' * [index] ', eventType);
                });
            });
            var progress = function(info) {
                if (info.position % 100 === 0) {
                    var len = _.values(info.resources).length;
                    if (len > 0) {
                        var percent = Math.round(100 * info.position / len);
                        console.log('   - ' + percent + '% - ' //
                                + info.position + ' / ' + len);
                    }
                }
            }
            index.on('indexing:begin', progress);
            index.on('indexing:progress', progress);
            index.on('indexing:end', progress);
        }
        return this._index;
    },

    /** Builds and returns a full-text search index. */
    _buildIndex : function() {
        var that = this;
        return Mosaic.P.then(function() {
            return that._trace('_buildIndex', function() {
                var index = that._getLunrIndex();
                return index.index(that._allResources);
            })
        })
    },

    _indexResource : function(id, resource) {
        var index = this._getLunrIndex();
        return index.index([ resource ]);
    },

    /** Returns a resource corresponding to the specified identifier. */
    _findResourceById : function(resourceId) {
        var that = this;
        return Mosaic.P.then(function() {
            if (!resourceId)
                return null;
            var resources = that.getResources();
            return _.find(resources, function(resource) {
                return resource.properties.id === resourceId;
            });
        });
    },

    /** Resets search results and sets all existing resources in this store. */
    _resetResources : function() {
        this._resources = _.values(this._allResources);
    },

    /**
     * Searches resources corresponding to the specified search criteria and
     * returns a promise with search results.
     */
    _searchResources : function() {
        var that = this;
        return that._allResourcesPromise.then(function() {
            return that._trace('_searchResources', function() {
                that._sort = {
                    sortBy : undefined,
                    direct : true
                };
                var criteria = that.getSearchCriteria();
                var q = criteria.q || '';
                var promise = that._index.search(q).then(function(result) {
                    return result.resources;
                });
                return promise.then(function(list) {
                    that._resources = that._filterResources(list, criteria);
                    return that._resources;
                });
            });
        }).then(function() {
            var selectedResourceId = that.getSelectedResourceId();
            that.notify();
            if (selectedResourceId !== undefined) {
                // return that.selectResource({
                // resourceId : selectedResourceId
                // });
            }
        });
    },

    /** Sorts search results by the currently defined fields. */
    _sortResults : function() {
        var inverted = false;
        var getField;
        if (this._sort.sortBy == 'name') {
            getField = function(r) {
                return (r.properties.name + '').toLowerCase();
            }
        } else if (this._sort.sortBy == 'date') {
            getField = function(r) {
                var changes = r.properties.updated || new Date().getTime();
                return changes;
            }
        }
        if (getField) {
            this._resources = _.sortBy(this._resources, getField, this);
            if (!this._sort.direct) {
                this._resources.reverse();
            }
        }
    },

    /** Removes all resources not matching to the specified search criteria. */
    _filterResources : function(resources, criteria) {
        var filter = this._getFilterFunction(criteria);
        if (!filter)
            return resources;
        return _.filter(resources, function(resource) {
            return filter(resource);
        });
    },

    /**
     * Transforms the specified search criteria into a filtering function
     * accepting or not a given resource.
     */
    _getFilterFunction : function(criteria) {
        var that = this;
        var filters = [];
        _.each(that._fields.fields, function(info, field) {
            info = info || {};
            if (!info.filter)
                return;
            var prefix = 'properties.';
            var f = field;
            f = f.indexOf(prefix) === 0 ? f.substring(prefix.length) : f;
            var filter = ResourceFieldsAccessor.getValue(criteria, f);
            if (!filter)
                return;
            filter = that.prepareFilterValues(filter);
            if (info.filter === 'prefix') { // FIXME : generalize it!
                filter = _.map(filter, function(f) {
                    return function(value) {
                        var str = '' + value;
                        return str.indexOf(f) === 0;
                    };
                });
            }
            filters.push(function(resource) {
                var value = ResourceFieldsAccessor.getValue(resource, field);
                var result = that.filterValues(value, filter);
                return result;
            });
        });
        if (!filters.length) {
            return null;
        }
        return filters.length == 1 ? filters[0] : function(resource) {
            var result = true;
            for (var i = 0; result && i < filters.length; i++) {
                result &= filters[i](resource);
            }
            return result;
        };
    },

    _toArray : function(values) {
        if (!values)
            return [];
        if (_.isArray(values))
            return values;
        return [ values ];
    },

    _trace : function(message, callback) {
        var start = new Date().getTime();
        var result = callback();
        var end = new Date().getTime();
        return result;

    }
});
