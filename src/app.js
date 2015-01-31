
(function () {

	/**
	 * Module dependencies.
	 */

	var path = require("path"),
		spawn = require('child_process').spawn,
		carrier = require('carrier'),
		sys = require('sys'),
		async = require('async'),
		argv = require('minimist')(process.argv.slice(2)),
		kue = require('kue'),
		jobs = kue.createQueue({
			prefix: 'q',
			redis: {
				port: process.env.REDIS_PORT || 6379,
				host: process.env.REDIS_HOST || 'localhost',
				db: process.env.REDIS_DB || 0
			}
		});
	
	/**
	 * Functionality
	 */
	
	// Returns a random integer between min (included) and max (excluded)
	// Using Math.round() will give you a non-uniform distribution!
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}
	
	function pushJob(queue, data) {
		var job;
		
		job = jobs.create(queue, data).save( function(err){
			if( !err ) console.log('Job %d in %s is created with %s', job.id, queue, data);
		});
	}
	
	function producer() {
		
		//create jobs on 1 to 5 random seconds in a two random queue (kudo-1 and kudo-2)
		
		function selectQueueAndPush(data) {
			
			var randomValue = getRandomInt(1, 3);
			
			console.log('randomValue: %d', randomValue);
			
			switch(randomValue) {
				case 1:
					console.log('Push in kudo-1');
					pushJob('kudo-1', data);
					break;
				case 2:
					console.log('Push in kudo-2');
					pushJob('kudo-2', data);
					break;
			}
		}
		
		function createJobs() {
			
			var timeToWait = getRandomInt(1, 6),
				data = {
					title: 'New Job',
					moreData: 'More data'
				};
			
			console.log('Init Job.');
			
			selectQueueAndPush(data);
			
			console.log('New Job in %s.', timeToWait);
			
			setTimeout(createJobs, timeToWait * 1000);
		}
		
		createJobs();
	}
	
	function consumer(queue, job, done) {
		
		var timeToWait = getRandomInt(6, 11);
		
		console.log('Time to process the job %d: %s', job.id, timeToWait);
		
		setTimeout(function() {
			if (queue == 'kudo-1') {
				console.log('The job %d goes to kudo-2 because it went from kudo-1', job.id);
				pushJob('kudo-2', job.data);
			}
			done();
		}, timeToWait * 1000);
	}
	
	/**
	 * Execution/Initialization
	 */
	
	console.log('argv:');

	console.dir(argv);
	
	
	if (argv.p) {
		
		//kue.app.listen(3000);
		
		console.log('Producer');
		producer();
	}
	
	if (argv.c){
		console.log('Consumer');
		
		jobs.process('kudo-1', function(job, done){
		
			console.log('Process queue: kudo-1');
			
			consumer('kudo-1', job, done);
		});
		
		jobs.process('kudo-2', function(job, done){
			
			console.log('Process queue: kudo-2');
			
			consumer('kudo-2', job, done);
		});
	}
})();
