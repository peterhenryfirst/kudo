
(function () {

	/**
	 * Module dependencies.
	 */

	var path = require("path"),
		spawn = require('child_process').spawn,
		carrier = require('carrier'),
		sys = require('sys'),
		async = require('async'),
		kue = require('kue'),
		jobs = kue.createQueue({
			prefix: 'q',
			redis: {
				port: process.env.REDIS_PORT || 6379,
				host: process.env.REDIS_HOST || 'localhost',
				db: process.env.REDIS_DB || 0
			}
		});
	
	
	
	var argv = require('minimist')(process.argv.slice(2));
	
	console.log('argv:');

	console.dir(argv);
	
	console.log('KUDO');
	
	var job = jobs.create('email', {
		title: 'welcome email for tj',
		to: 'tj@learnboost.com',
		template: 'welcome-email'
	}).save( function(err){
		if( !err ) console.log( job.id );
	});
	
	/*
	if (argv.tasks) {
		console.log('Demux disc tasks');
		
		var tasks = require(argv.tasks);
		
		console.log('tasks:');
		
		console.log(sys.inspect(tasks));
		
		demux_disc(tasks, function(err) {
			console.log('demux_disc end');
		});
		
	} else {
		console.log('Processing disc to demux');
		
		create_demux_tasks(function (err) {
			if (err) {
				console.log('Error on create_demux_tasks: ' + err);
				return;
			}
			console.log("Processing disc to demux ended");
		});
	}
	/**/
})();
