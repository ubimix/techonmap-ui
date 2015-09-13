var _ = require('underscore');
var React = require('react');
var Mosaic = require('mosaic-commons');
var MosaicLeaflet = require('mosaic-core').Leaflet;
var L = require('leaflet');
var EsriGeoLocation = require('./EsriGeoLocation');

var GeolocationWidget = React.createClass({
    displayName : 'GeolocationWidget',

    componentWillMount : function(){
        this._setLatLng = _.debounce(this._setLatLng, 100);
        this._geolocService = new EsriGeoLocation();
    },
    
    getInitialState : function(){
        return this._newState();
    },

    _copy : function(from, to){
        _.each(from, function(value, key) {
            var oldValue = to[key];
            if (_.isObject(value)) {
                if (!_.isObject(oldValue)) {
                    oldValue = to[key] = {};
                }
                this._copy(value, oldValue);
            } else {
                to[key] = value;
            }
        }, this);
    },
    
    _newState : function(options){
        options = options || {};
        var state = {};
        this._copy(this.state, state);
        this._copy(options, state);
        return state;
    },

    _getInfo : function(){
        if (!this._info) {
            this._info = this.props.info || {
                address : {
                    name : 'properties.address',
                    placeholder  : 'Address',
                    value: ''
                },
                postcode: {
                    name : 'properties.postcode',
                    placeholder  : 'Postcode',
                    value: ''
                },
                city : {
                    name : 'properties.city',
                    placeholder  : 'City',
                    value: ''
                },
                latitude : {
                    name: 'geometry.coordinates.0',
                    type: 'hidden',
                    value : ''
                },
                longitude : {
                    name: 'geometry.coordinates.1',
                    type: 'hidden',
                    value : ''
                },
                localizeBtn : {
                    label : 'Localize on the map',
                    name : '',
                    value : ''
                },
                map : {
                    style : {width: '100%', height:'200px'},
                }
            };
        }
        return this._info;
    },
    
    _onChange : function(field, ev) {
        var options = {};
        var obj = options[field] = options[field] || {};
        obj.value = ev.target.value;
        this._updateInfo(options);
    },
    
    _updateInfo : function(obj) {
        var info = this._getInfo();
        this._copy(obj, info);
        this.setState(this._newState({}));
        if (this.props.onAddressChange) {
            this.props.onAddressChange(info);
        }
    },
    
    componentDidUpdate : function(){
        this._focusMap(false);
    },
    
    _focusMap : function(updateZoom){
        if (this._map) {
            var latlng = this._getMarkerCoordinates();
            var newMarker = this.props.marker; 
            if (this._marker !== newMarker) {
                if (this._marker){
                    this._map.removeLayer(this._marker);
                }
                this._marker = newMarker;
                if (this._marker){
                    this._map.addLayer(this._marker);
                    this._marker.on('dragend', function(){
                        if (!this._marker)
                            return ;
                        var latlng = this._marker.getLatLng();
                        this._setLatLng(latlng.lat, latlng.lng);
                    }, this);
                }
            }
            if (this._marker) {
                this._marker.setLatLng(latlng);
            }
            if (updateZoom) {
                var zoom = this.props.zoom || 17;
                this._map.setView(latlng, zoom);
            } else {
                this._map.panTo(latlng);
            }
        }
    },
    
    _getMarkerCoordinates : function(){
        var info = this._getInfo();
        var center = this.props.center;
        if (!center || (!center[0] && !center[1]) ) {
            var bbox = info.bbox;
            if (bbox) {
                center = [
                    (bbox[0][0] + bbox[1][0]) / 2,
                    (bbox[0][1] + bbox[1][1]) / 2
                ];
            }
        }
        if (!center){
            center = [0, 0];
        }
        var lat = info.latitude.value || center[1];
        var lng = info.longitude.value || center[0];
        var result = L.latLng(lat, lng);
        return result; 
    },
    
    _onMapAdd : function(map){
        this._map = map;
        this._tiles = L.tileLayer(this.props.tilesUrl, {
            attribution : this.props.attribution,
            maxZoom : this.props.maxZoom || 18,
            minZoom : this.props.minZoom || 0
        });
        map.addLayer(this._tiles);
        this._focusMap(true);
    },
    _onMapRemove : function(map){
        map.removeLayer(this._tiles);
        delete this._tiles;
        if (this._marker) {
            map.removeLayer(this._marker);
            delete this._marker;
        }
        delete this._map;
    },
    _setLatLng : function(lat, lng){
        var info = this._getInfo();
        var bbox = info.bbox;
        if (bbox) {
            function checkIn(val, a, b){
                var min = Math.min(a, b);
                var max = Math.max(a, b);
                return val >= min && val <= max;
            }
            if (!checkIn(lng, bbox[0][0], bbox[1][0])
                    || !checkIn(lat, bbox[0][1], bbox[1][1])) {
                return ;
            }
        }
        this._updateInfo({
            latitude  : {
                value: lat
            },
            longitude : {
                value : lng
            }
        });
    },
    render : function() {
        var info = this._getInfo();
        var addrInfo = info.address;
        var addressInput = <input type="text" className="form-control"
            name={addrInfo.name}
            ref="address"
            placeholder={addrInfo.placeholder}
            value={addrInfo.value}
            onChange={this._onChange.bind(this, 'address')} />;

        var postcodeInfo = info.postcode;
        var postcodeInput = <input type="text" className="form-control"
            name={postcodeInfo.name} 
            ref="postcode"
            placeholder={postcodeInfo.placeholder}
            value={postcodeInfo.value} 
            onChange={this._onChange.bind(this, 'postcode')} />;

        var cityInfo = info.city;
        var cityInput = <input type="text" className="form-control"
            name={cityInfo.name} 
            ref="city"
            placeholder={cityInfo.placeholder}
            value={cityInfo.value}
            onChange={this._onChange.bind(this, 'city')} />;

        var latitudeInfo = info.latitude;
        var latitudeInput = <input className="form-control"
            name={latitudeInfo.name}
            type={latitudeInfo.type||'text'}
            ref="latitude"
            key="latitude"
            placeholder={latitudeInfo.placeholder}
            value={latitudeInfo.value}
            onChange={this._onChange.bind(this, 'latitude')} />;

        var longitudeInfo = info.longitude;
        var longitudeInput = <input className="form-control"
            name={longitudeInfo.name}
            type={longitudeInfo.type||'text'}
            ref="longitude"
            key="longitude"
            placeholder={longitudeInfo.placeholder}
            value={longitudeInfo.value}
            onChange={this._onChange.bind(this, 'longitude')} />;

        function localizeAddress(ev){
            var addr = info.address.value;
            var postcode = info.postcode.value;
            var city = info.city.value;
            var array = [];
            if (addr) {array.push(addr);}
            if (postcode) {array.push(postcode);}
            if (city) {array.push(city);}
            array.push('France');
            
            var address = array.join(', ');
            var that = this;
            that._geolocService.geolocalize({
                address : address
            }).then(function(result) {
                var obj = result[0];
                if (obj) {
                    that._setLatLng(obj.lat, obj.lng);
                    var latLng = that._getMarkerCoordinates();
                    that._map.setView(latLng, 16);
                }
            }, function(err) {
                this._updateInfo({
                    address : {
                        error: err
                    }
                });
            });
            ev.preventDefault();
            ev.stopPropagation();
        }
        var localizeButton = (
            <button onClick={localizeAddress.bind(this)}
                className="btn btn-primary btn-xs">
                {info.localizeBtn.label}
            </button>
        );
            
        var mapView = (
            <MosaicLeaflet.ReactMap
                onMapAdd={this._onMapAdd}
                onMapRemove={this._onMapRemove}
                style={info.map.style}/>
        );
        
        var className = 'form-group';
        var errorsIndex = {};  
        var errors = _.filter(info, function(obj, name) {
            var hasError = !!obj.error;
            if (hasError) {
                errorsIndex[name] = obj;
            }
            return hasError;
        });
        if (errors.length) {
            className = 'form-group has-error';
        } 
        function getClassName(){
            var className = 'form-group';
            if (_.find(arguments, function(name) {
                return _.has(errorsIndex, name);
            })) {
                className += ' has-error';
            }
            return className;
        }
        function formatErrors(){
            var result = [];
            _.each(arguments, function(name, pos) {
                var obj = errorsIndex[name];
                if (!obj)
                    return ;
                result.push(<div className="alert alert-warning" key={pos}>
                        {obj.error}
                </div>);   
            });
            if (result.length) {
                return (
                    <div className="form-group has-error">
                        <div className="col-sm-12">{result}</div>
                    </div>
                );
            }
            return '';
        }
        
        return (
            <div>
                <div className={getClassName('address', 'postcode', 'city')}>
                    <div className="col-sm-5">{addressInput}</div>
                    <div className="col-sm-3">{postcodeInput}</div>
                    <div className="col-sm-4">{cityInput}</div>
                </div>
                {formatErrors('address', 'postcode', 'city')}
                <div className={getClassName('latitude', 'longitude')}>
                    <div className="col-sm-12">
                        <div>
                            {localizeButton}
                            {latitudeInput}
                            {longitudeInput}
                        </div>
                        {mapView}
                    </div>
                </div>
                {formatErrors('latitude', 'longitude')}
            </div>
        );
    }
});

module.exports = GeolocationWidget;