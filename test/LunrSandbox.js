var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var LunrWrapper = require('../app/js/tools/LunrWrapper');

var data = require('../data/data.json');
var fields = require('../data/data.fields.json').fields;

var index = new LunrWrapper({
    fields : fields
});
var events = [ //
'configuration:begin', 'configuration:end', //
// 'indexing:begin', 'indexing:end',//
'search:begin', 'search:end'// 
];
_.each(events, function(eventType) {
    index.on(eventType, function() {
        console.log(' * ', eventType);
    });
});
var progress = function(info) {
    if (info.position % 100 === 0) {
        var length = (info.resources || []).length;
        var percent = Math.round(100 * info.position / length);
        console.log('   - ' + percent + '% - ' + info.position + //
        ' / ' + length);
    }
}
index.on('indexing:begin', progress);
index.on('indexing:progress', progress);
index.on('indexing:end', progress);

index.index(data.features);
Mosaic.P//
//
.then(function() {
    return showResults(index, 'éloquentes');
}).then(function(results) {
    return showResults(index, 'clevermate education');
});

function showResults(index, query) {
    return index
            .search(query)
            .then(
                    function(results) {
                        console
                                .log('---------------------------------------------------');
                        console.log('QUERY: ', query);
                        console.log('RESULTS: ');
                        _.each(results.resources, function(r) {
                            var descr = r.properties.description;
                            var maxLen = 80;
                            if (descr.length > maxLen) {
                                descr = descr.substring(0, maxLen - 3) + '...';
                            }
                            console.log('   - [' + r.id + '] '
                                    + r.properties.name + ' - ', descr);
                        })
                    });
}
