var expect = require('expect.js');
var _ = require('underscore');
var Navigation = require('../app/js/models/nav/Navigation');

describe('Navigation', function() {

    it('should serialize/deserialize values to/from URLs - test 1', function() {
        var nav = new Navigation({
            category : 'marketing',
            language : 'en',
            companyId : '123',
            search : {
                tags : [ 'web', 'sites' ],
                q : 'Hello'
            }
        });
        var url = nav.toUrl({
            pathname : "/{language}/category/{category}",
            query : {
                q : '{search.q}',
                tags : '{search.tags}'
            },
            hash : '{companyId}'
        });
        expect(url).to
                .eql('/en/category/marketing?q=Hello&tags=web&tags=sites#123');

        // Parse values
        var test = new Navigation();
        test.fromUrl(url, {
            'pathname' : function(options) {
                var path = options.value;
                var array = _.filter(path.split('/'), function(s) {
                    return !!s;
                });
                this.addValues('language', this.extractSegments(array[0]));
                this.addValues('category', this.extractSegments(array[2]));
            },
            'query.q' : 'search.q',
            'query.tags' : 'search.tags',
            'hash' : 'companyId'
        });
        var control = new Navigation({
            language : 'en',
            category : 'marketing',
            search : {
                q : 'Hello',
                tags : [ 'web', 'sites' ]
            },
            companyId : '123'
        });
        expect(test).to.eql(control);
    });

    it('should serialize/deserialize values to/from URLs - test 2', function() {
        var nav = new Navigation();
        nav.setValue('language', 'en');
        nav.setValue('search.q', 'Hello');
        nav.setValues('search.tags', [ 'research', 'algorithm' ]);
        nav.addValues('category', [ 'it,big data', 'biotech' ]);
        nav.setValue('mode', 'mobile');
        nav.setValue('header', 'yes');
        nav.setValue('focus', 'mycompany');
        var url = nav.toUrl({
            pathname : '/{language}/category/{category}/tags/{search.tags}',
            query : {
                q : '{search.q}',
                mode : '{mode}',
                header : '{header}'
            },
            hash : '{focus}'

        });
        expect(url).to.eql('' + //
        '/en/category/it%2Cbig%20data,biotech/tags/research,algorithm' + // 
        '?q=Hello&mode=mobile&header=yes' + //
        '#mycompany');

        var test = new Navigation();
        test.fromUrl(url, {
            'pathname' : function(options) {
                var path = options.value;
                var array = _.filter(path.split('/'), function(s) {
                    return !!s;
                });
                this.addValues('language', this.extractSegments(array[0]));
                this.addValues('category', this.extractSegments(array[2]));
                this.addValues('search.tags', this.extractSegments(array[4]));
            },
            'query.q' : 'search.q',
            'query.mode' : 'mode',
            'query.header' : 'header',
            'hash' : 'focus'
        });
        expect(test).to.eql(nav);
        expect(nav.isEqual(test)).to.be(true);
    });

    it('should simplify paths', function() {
        var nav = new Navigation();
        var path = undefined;
        nav.addChangeListener(function(ev) {
            path = ev.path;
        });
        nav.setValue('search....q', 'hello');
        expect(nav.getValue('search..q')).to.eql('hello');
        expect(path).to.eql('search.q');
    });

    it(
            'should be able to notify about individual '
                    + 'navigation path changes', function() {
                var nav = new Navigation();
                var path = '';
                nav.addChangeListener('a.b.c', function(ev) {
                    path = ev.path;
                });
                nav.setValue('a..b..c....d..e', 'hello');
                expect(path).to.eql('a.b.c.d.e');
                expect(nav.getValue()).to.eql({
                    a : {
                        b : {
                            c : {
                                d : {
                                    e : 'hello'
                                }
                            }
                        }
                    }
                });

                nav.setValue('a..b..c.d', 'HELLO');
                expect(path).to.eql('a.b.c.d');
                expect(nav.getValue()).to.eql({
                    a : {
                        b : {
                            c : {
                                d : 'HELLO'
                            }
                        }
                    }
                });

                // This value should not be notified to the registered listener
                nav.setValue('a.b.f', 'XXX');
                expect(path).to.eql('a.b.c.d'); // The old path
                expect(nav.getValue()).to.eql({
                    a : {
                        b : {
                            c : {
                                d : 'HELLO'
                            },
                            f : 'XXX'
                        }
                    }
                });

            });

    it('should be able manage individual values', function() {
        var nav = new Navigation();
        var changed = false;
        nav.addChangeListener(function() {
            changed = true;
        });

        nav.setValue('search.q', 'hello');
        expect(changed).to.eql(true);
        expect(nav.getValue('search.q')).to.eql('hello');
        expect(nav.getValue('search')).to.eql({
            'q' : 'hello'
        });
        expect(nav.getValue('')).to.eql({
            'search' : {
                'q' : 'hello'
            }
        });

        // Multivalues
        changed = false;
        nav.addValue('search.tag', 'abc');
        expect(changed).to.eql(true);
        expect(nav.getValue('search.tag')).to.eql('abc');
        changed = false;
        nav.addValue('search.tag', 'cde');
        expect(changed).to.eql(true);
        changed = false;
        expect(nav.getValue('search.tag')).to.eql([ 'abc', 'cde' ]);
        expect(nav.getValue()).to.eql({
            'search' : {
                q : 'hello',
                tag : [ 'abc', 'cde' ]
            }
        });

    });
    //
    // it('should be able visit URL templates', function() {
    // var templ = {
    // pathname : "/{language}/category/{category}",
    // query : {
    // q : 'search.q',
    // tags : 'search.tags'
    // },
    // hash : 'companyId'
    // };
    // })

});
