var _ = require('underscore');
var newMapClusterMarker = require('./MapClusterMarker');

module.exports = function(options) {
    return {
        // maxClusterRadius : 50,
        showCoverageOnHover : false,
        showCoverageOnHover : true,
        iconCreateFunction : _.bind(function(cluster) {
            var clusterOptions = _.extend({}, options, {
                cluster : cluster
            });
            return newMapClusterMarker(clusterOptions);
        }),
        polygonOptions : {
            fill : true,
            fillColor : 'white',
            fillOpacity : 0.8,
            stroke : true,
            color : 'white',
            weight : 10,
            opacity : 0.5
        }
    };
};