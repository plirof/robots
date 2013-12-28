
requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/',
	
	paths: {
		'lodash': 'src/lodash-2.4.1',
		'robots.cards': 'src/robots.cards',
		'chai': 'node_modules/chai/chai',
		'fake-context': 'test/fake-context'
	},
	
    shim: {
        d3: {
            exports: 'd3'
        },
		chai: {
			exports: 'chai'
		}
    },
    
    // ask Require.js to load these files (all our tests)
    deps: Object.keys(window.__karma__.files).filter(function (file) {
        return  /^\/base\/test\/.*-spec\.js$/.test(file);
    }),
	
    // start test run, once Require.js is done
    callback: window.__karma__.start
});
