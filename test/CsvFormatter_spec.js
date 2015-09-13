var expect = require('expect.js');
var CsvFormatter = require('../app/js/tools/CsvFormatter');

describe('CsvFormatter', function() {
    it('should be able to generate a CSV file', function() {
        var formatter = new CsvFormatter();
        formatter.addField('Name', 'properties.name');
        formatter.addField('Address', 'properties.address');
        formatter.addField('City', 'properties.city');
        formatter.addField('Building', 'properties.building');
        // formatter.addField('Coordinates', 'geometry');
        formatter.addField('Lat', 'geometry.coordinates.0');
        formatter.addField('Lng', 'geometry.coordinates.1');
        var objects = [ {
            properties : {
                name : 'My Super Company',
                address : 'First Street, X',
                city : 'Springfield',
                building : 11,
            },
            geometry : {
                type : 'Point',
                coordinates : [ 10.1, 20.2 ]
            }
        }, {
            properties : {
                name : 'Company Nb Two',
                address : 'Second Street',
                city : 'Springfield',
                building : 22,
            },
            geometry : {
                type : 'Point',
                coordinates : [ 30.3, 40.4 ]
            }
        } ];
        var str = formatter.toCsv({
            objects : objects
        });
        var control = '' + //
        '"Name","Address","City","Building","Lat","Lng"\n' + //
        '"My Super Company","First Street, X","Springfield",11,10.1,20.2\n' + //
        '"Company Nb Two","Second Street","Springfield",22,30.3,40.4\n' + //
        '';
        expect(str).to.eql(control);
    });
});
