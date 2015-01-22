
(function () {

	/**
	 * Module dependencies.
	 */

	var path = require("path"),
		spawn = require('child_process').spawn,
		carrier = require('carrier'),
		sys = require('sys'),
		async = require('async');

	var argv = require('minimist')(process.argv.slice(2));

	function demux_disc(tasks, callback) {
		
		var tasksArray = [];
		
		for (var i = 0; i < tasks.length; i++) {
			tasksArray.push(demux_task(tasks[i]));
		}
		
		async.parallel(tasksArray, function(err, results){
			if (err) {
				console.log('Async Error: ' + err);
				callback(err);
				return;
			}
			
			callback(null);
		});
	}

	var demux_task = function(taskInfo) {
		return function(callback) {
			var exeArgs = [taskInfo.brdPath, taskInfo.trackNumber];
			/*
			taskInfo.track.forEach(function(v) {
				if (v.indexOf(' ') >= 0)
					exeArgs.extend();
				this.push(v);
			}, this);
			*/
			exeArgs.extend(taskInfo.track);
			
			console.log('exeArgs:');
			
			console.log(sys.inspect(exeArgs));
			
			carrier.carry(spawn(task.exePath, exeArgs).stdout).
			on('line', function (line) {
				console.log(line);
			})
			.on('error', function (err) {
				callback('demux_task error:' + err);
			})
			.on('end', function () {
				console.log('demux_task end');
				callback(null, taskInfo);
			});
		};
	};

	function create_demux_tasks(callback) {
		find_tracks(function (err, tracks) {
			if (err) {
				console.log('Error: ' + err);
				callback(err);
				return;
			}
			var checkInfoArray = [];
			
			for (var i = 0; i < tracks.length; i++) {
				checkInfoArray.push(check_track(tracks[i]));
			}
			
			async.parallel(checkInfoArray, function(err, results){
				if (err) {
					console.log('Async Error: ' + err);
					callback(err);
					return;
				}
				/*
				console.log('RESULT');
				console.log(sys.inspect(results));
				/**/
				
				var jf = require('jsonfile'),
					filePath = task.outPath + task.tasksFileName;
				
				//write result
				console.log('tasks will write in: ' + filePath);
				jf.writeFile(filePath, results, function(err) {
					if (err) {
						console.log('write file Error: ' + err);
						callback(err);
						return;
					}
					console.log('tasks wrote in: ' + filePath);
					callback(null);
				});
			});
		});
	}

	var check_track = function(trackInfo) {
		return function (callback) {
			var exeArgs = [trackInfo.brdPath, trackInfo.trackNumber];
			
			carrier.carry(spawn(task.exePath, exeArgs).stdout).
			on('line', function (line) {
				var lineTrim = line.trim().replace(/[\x00-\x1f]/g, '');
				var regexp = /^[1-9]\:/;
				var matches  = regexp.exec(lineTrim);
				/*
				console.log('Line');
				console.log('charCodeAt(0): ' + lineTrim.charCodeAt(0));
				console.log('charAt(0): ' + lineTrim.charAt(0));
				console.log(lineTrim.length);
				
				console.log('matches:');
				console.log(matches);
				*/
				if(matches ) {
					var more = lineTrim.replace(regexp, '').trim().split(',');
					//console.log(more);
					var foundTrackElement = task.trackElements[more[0]];
					if (!foundTrackElement) {
						callback('No exist track element info for line: ' + lineTrim);
					}
					if (!trackInfo.track) {
						trackInfo.track = [];
					}
					var demuxTrack = matches[0] + task.outPath + trackInfo.name + foundTrackElement.outSufixName;
					
					if (foundTrackElement.languagePos) {
						//console.log('Lang: ' + more[foundTrackElement.languagePos]);
						demuxTrack += '.' + lang.getIsoLang(more[foundTrackElement.languagePos].trim());
					}
					
					demuxTrack += foundTrackElement.outExtension;
					
					trackInfo.track.push(demuxTrack);
					
					if (foundTrackElement.params) {
						trackInfo.track.push(foundTrackElement.params);
						//demuxTrack += ' ' + foundTrackElement.params;
					}
				}
			})
			.on('error', function (err) {
				callback('can\'t load brd info:' + err);
			})
			.on('end', function () {
				//console.log('Found trackinfo ' + sys.inspect(trackInfo));
				callback(null, trackInfo);
			});
		};
	};

	function find_tracks(callback) {
		var tracks = [];
		carrier.carry(spawn(task.exePath, task.args).stdout).
		on('line', function (line) {
			var lineTrim = line.replace(/[\x00-\x1f]/g, '');
			var regexp = /^[1-9]\)/;
			var matches  = regexp.exec(lineTrim);
			/*
			console.log('Line');
			console.log('charCodeAt(0): ' + lineTrim.charCodeAt(0));
			console.log('charAt(0): ' + lineTrim.charAt(0));
			console.log(lineTrim.length);
			
			console.log('matches:');
			console.log(matches);
			*/
			if(matches ) {
				//console.log(lineTrim.split(','));
				var splitLine = lineTrim.split(',');
				var name = splitLine.length == 3 ? splitLine[1].trim() : splitLine[0].trim();
				tracks.push({
					brdPath: task.args[0],
					trackNumber: matches[0],
					name: name
				});
			}
		})
		.on('error', function (err) {
			callback("can't load brd info:" + err);
		})
		.on('end', function () {
			//console.log('Found tracks ' + sys.inspect(tracks));
			//callback(null, { tracks: tracks });
			callback(null, tracks);
		});
	}
	
	console.log('argv:');

	console.dir(argv);

	if (argv.tasks) {
		console.log('Demux disc tasks');
		
		var tasks = require(argv.tasks);
		
		/*
		console.log('tasks:');
		
		console.log(sys.inspect(tasks));
		*/
		
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
	
})();
