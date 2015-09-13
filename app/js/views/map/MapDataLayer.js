var _ = require('underscore');
var L = require('leaflet');
require('leaflet.markercluster');
var AbstractMapLayer = require('./AbstractMapLayer');
var ResourceUtilsMixin = require('../../tools/ResourceUtilsMixin');
var React = require('react');

/** */
module.exports = AbstractMapLayer.extend({

    initialize : function(options) {
        AbstractMapLayer.prototype.initialize.apply(this, arguments)
        // this._showMarkerPopup = _.debounce(this._showMarkerPopup, 200);
    },

    // -----------------------------------------------------------------------

    /** This method is called when this layer is added to the map. */
    onAdd : function(map) {
        this._map = map;
        this._registerHandlers();
        this._reloadData();
    },

    /**
     * Removes all registered layers from the map. Cleans up all map listeners.
     */
    onRemove : function(map) {
        this._removeMarkers();
        this._removeHandlers();
        delete this._map;
    },

    // -----------------------------------------------------------------------

    _getApp : function() {
        return this.options.app;
    },

    /**
     * Returns map options from the global application options.
     */
    _getMapOptions : function() {
        var app = this._getApp();
        var mapOptions = app.options.map;
        return mapOptions;
    },

    // -----------------------------------------------------------------------

    /**
     * Registers handlers (listeners) responsible for marker redrawing and
     * selected item highlighting.
     */
    _registerHandlers : function() {
        var app = this._getApp();
        app.res.addChangeListener(this._reloadData, this);
        app.res.addSelectListener(this._onSelectResource, this);
        this._map.on('zoomend', this._onZoomEnd, this);
        this._map.once('initialize', function(ev) {
            this._initialized = true;
            if (ev.reloadData) {
                this._reloadData();
            } else {
                this._onSelectResource();
            }
        }, this);
    },

    /**
     * Removes handlers (listeners) responsible for marker redrawing and
     * selected item highlighting.
     */
    _removeHandlers : function(map) {
        var app = this._getApp();
        app.res.removeChangeListener(this._reloadData, this);
        app.res.removeSelectListener(this._onSelectResource, this);
        this._map.off('zoomend', this._onZoomEnd, this);
    },

    // -----------------------------------------------------------------------

    /**
     * Initializes a cluster layer and an internal index of markers. This method
     * does not attache the cluster layer to the map.
     */
    _initMarkers : function() {
        var mapOptions = this._getMapOptions();
        this._index = {};
        var app = this._getApp();
        var type = 'default';
        var clusterOptions = //
        app.viewManager.newView('mapClusterOptions', type, {
            app : app
        }) || {};
        var clusterOptions = _.extend({
            spiderfyOnMaxZoom : true,
            zoomToBoundsOnClick : true,
        }, mapOptions.cluster, clusterOptions);
        this._clusterLayer = new L.MarkerClusterGroup(clusterOptions);
        this._map.addLayer(this._clusterLayer);
    },

    /**
     * Removes markers and cluster layer from the map; cleans up the index of
     * individual markers.
     */
    _removeMarkers : function() {
        this._clearSelectedMarker();
        if (this._clusterLayer) {
            this._map.removeLayer(this._clusterLayer);
            delete this._clusterLayer;
        }
        delete this._index;
    },

    /**
     * This method is called when the data are updated
     */
    _redrawMarkers : function() {
        this._removeMarkers();
        this._initMarkers();

        var app = this._getApp();
        var data = app.res.getResources();
        var that = this;
        var options = {};
        _.each(data, function(d) {
            var id = app.res.getResourceId(d);
            if (!id)
                return;
            var marker;
            L.GeoJSON.geometryToLayer(d, function(resource, latlng) {
                marker = that._newMarker(latlng, resource);
                return marker;
            }, L.GeoJSON.coordsToLatLng, options);
            if (marker) {
                this._index[id] = marker;
            }
        }, this);

        var markers = _.values(this._index);
        this._clusterLayer.addLayers(markers);
        this._onSelectResource();
    },

    /**
     * This method is called when search results are updated.
     */
    _reloadData : function() {
        var app = this._getApp();
        var data = app.res.getResources();
        if (this._initialized && data && data.length) {
            var bbox = ResourceUtilsMixin.getBoundingBox(data);
            var sw = L.GeoJSON.coordsToLatLng(bbox[0]);
            var ne = L.GeoJSON.coordsToLatLng(bbox[1]);
            var bounds = L.latLngBounds(sw, ne);
            if (this.options.viewport) {
                this.options.viewport.fitBounds(bounds);
            } else {
                this._map.fitBounds(bounds);
            }
        }
        this._redrawMarkers();
    },

    // -----------------------------------------------------------------------
    // Resource-specific views

    /** Creates and returns a new marker for the specified resource. */
    _newMarker : function(latlng, resource) {
        var app = this._getApp();
        var type = app.res.getResourceType(resource);
        var marker = app.viewManager.newView('mapMarker', type, {
            app : app,
            resource : resource,
            type : type,
            latlng : latlng
        });
        if (!marker)
            return null;
        marker.on('click', function() {
            var id = app.res.getResourceId(resource);
            app.res.selectResource({
                resourceId : id,
                force : true
            });
        });
        var that = this;
        marker.on('mouseover', _.debounce(function() {
            that._showMarkerPopup(marker, resource);
        }, 250));
        return marker;
    },

    /** Creates and returns a new popup for the specified resource */
    _newPopup : function(latlng, resource, options) {
        var app = this._getApp();
        var type = app.res.getResourceType(resource);
        var id = app.res.getResourceId(resource);
        var selected = id === app.res.getSelectedResourceId();
        var view = app.viewManager.newView('mapPopup', type, _.extend({
            app : app,
            resource : resource,
            onClick : function() {
                var id = app.res.getResourceId(resource);
                app.res.selectResource({
                    resourceId : id
                });
            },
            selected : selected
        }, options));
        var popup;
        if (view) {
            var popupElement = L.DomUtil.create('div', 'popup-panel');
            React.render(view, popupElement);
            popup = L.popup();
            popup.setContent(popupElement);
            popup.on('close', function() {
                React.unmountComponentAtNode(popupElement);
            });
        }
        return popup;
    },

    // -----------------------------------------------------------------------

    /**
     * This method is called to highlight currently active marker
     */
    _onSelectResource : function() {
        if (!this._map)
            return;
        var that = this;
        that._clearSelectedMarker();
        var app = this._getApp();
        var selectedId = app.res.getSelectedResourceId();
        var marker = that._index[selectedId];
        if (!marker)
            return;
        that._clusterLayer.zoomToShowLayer(marker, function() {
            var latlng = marker.getLatLng();
            if (that.options.viewport) {
                that.options.viewport.focusTo(latlng);
            } else {
                that._map.panTo(latlng);
            }
            that._setSelectedMarker(marker);
        });
    },

    _onZoomEnd : function() {
        var zoom = this._map.getZoom();
        _.each(this._index, function(marker) {
            if (marker && marker.updateZoom)
                marker.updateZoom(zoom);
        });
    },

    /** Change styles for the selected marker and save it. */
    _setSelectedMarker : function(marker) {
        var that = this;
        that._clearSelectedMarker();
        that._selectedMarker = marker;
        if (that._selectedMarker.setSelection) {
            that._selectedMarker.setSelection(true);
        }
        var app = this._getApp();
        var resource = app.res.getSelectedResource();
        this._showMarkerPopup(marker, resource);
    },

    /** Removes specific styles for the selected marker. */
    _clearSelectedMarker : function() {
        var that = this;
        if (that._selectedMarker) {
            if (that._selectedMarker.setSelection) {
                that._selectedMarker.setSelection(false);
            }
            that._selectedMarker.closePopup();
            // TODO: remove selection from the marker
            delete that._selectedMarker;

        }
    },

    /**
     * This method is called when user clicks on individual markers. This method
     * to launches a select resource intent.
     */
    _selectResource : function(resourceId) {
        var app = this._getApp();
        app.res.selectResource({
            resourceId : resourceId
        });
    },

    /** Shows a popup on top of the specified marker */
    _showMarkerPopup : function(marker, resource, options) {
        var that = this;
        var latlng = marker.getLatLng();
        var app = that._getApp();
        var popup = that._newPopup(latlng, resource, options);
        if (popup) {
            marker.bindPopup(popup);
            marker.openPopup();
        }

    }
});
