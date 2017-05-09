Package.describe({
	name: 'rocketchat:chatops',
	version: '0.0.1',
	summary: 'Chatops Panel',
	git: ''
});

Package.onUse(function(api) {
	api.use([
		'coffeescript',
		'ecmascript',
		'rocketchat:lib',
		'dburles:google-maps@1.1.5',
		'underscore'
	]);
	api.use('templating', 'client');
	api.addFiles([
		'client/mapmipStartup.js',
		'client/tabBar.coffee',
		'client/views/chatops.html',
		'client/views/droneflight.html',
		'client/views/droneflight.js',
		'client/views/stylesheets/chatops.css',
		'client/model/locations.js',
		'client/views/linkLoc.js',
		'client/views/videodrone.html',
		'client/views/videodrone.js',
	], 'client');
	api.addFiles([
		'server/settings.js',
		'server/model/locations.js',
		'server/publications/locations.js'
	], 'server');
});
