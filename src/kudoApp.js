

var baseKudo = (function(baseSubModule){
	
	/**
	 * Module dependencies.
	 */
	
	var Docker = require("dockerode"),
		kue = require('kue'),
		jobs = kue.createQueue({
			prefix: 'q',
			redis: {
				port: process.env.REDIS_PORT || 6379,
				host: process.env.REDIS_HOST || 'localhost',
				db: process.env.REDIS_DB || 0
			}
		}),
		EventEmitter = require('events').EventEmitter,
		url = require("url"),
		fs = require('fs');
	
	
	
	/**
	 * Functionality / Private properties
	 */
	
	var containers = {
		producers: [],
		consumers: []
	};
	
	function checkQueue(max) {
		jobs.inactiveCount((function (err, n) {
			if (!err) {
				console.log('checkQueue: Inactive: %d', n);
				this.emitter.emit('check-inactive');
				if (n > max) {
					console.log('checkQueue: Max reached!');
					this.emitter.emit('max-reached');
				} else {
					console.log('checkQueue: Max did not reach');
					this.emitter.emit('max-not-reached');
				}
			}
		}).bind(this));
	}
	
	function dockerConnection() {
		var host = url.parse(process.env.DOCKER_HOST || '');
		
		if (!host.hostname) return { socketPath : process.env.DOCKER_HOST || '/var/run/docker.sock'};
		
		var tlsOn = (process.env.DOCKER_TLS_VERIFY || '0') === '1';
		var protocol = host.protocol === 'tcp:' ? (tlsOn ? 'https' : 'http') : host.protocol.substr(0, host.protocol.length - 1);
		
		var certPath = (process.env.DOCKER_CERT_PATH + '/') || '';
		
		return {
			protocol : protocol,
			host : host.hostname,
			port : parseInt(host.port) || 4243,
			ca : fs.readFileSync(certPath + 'ca.pem'),
			cert : fs.readFileSync(certPath + 'cert.pem'),
			key : fs.readFileSync(certPath + 'key.pem')
		};
	}
	
	function containerCreationOptions() {
		return {
			Env: ['REDIS_HOST=redis-db'],
			WorkingDir: '/var/src',
			HostConfig: {
				Binds:["/var/src:/var/src"],
				Links: ["redis-db:redis-db"]
			}
		};
		/*
		return {
			Env: ['REDIS_HOST=redis-db'],
			WorkingDir: '/var/src',
			ExposedPorts:{
				'3000/tcp': {}
			},
			HostConfig: {
				Binds:["/var/src:/var/src"],
				Links: ["redis-db:redis-db"],
				PortBindings: {'3000/tcp': [{ 'HostPort': '3000' }]}
			}
		};
		/**/
	}
	
	function runContainer(type, image, cmd, stdout, createOpts, fn) {
		this.docker.run(image, cmd, stdout, createOpts, fn).on('container', (function (container) {
			console.log();
			console.log('runContainer: on container type: %s', type);
			console.log('runContainer: on container:');
			console.log(container);
			
			this.containers[type].push(container.id);
			
			console.log('runContainer: containers:');
			console.log(this.containers);
		}).bind(this));
	}
	
	function removeContainer(containerType, containerId, fn) {
		
		//remove from array
		
		var index = this.containers[containerType].indexOf(containerId);
		if (index > -1) {
			this.containers[containerType].splice(index, 1);
		} else {
			console.log('Container %s did not find', containerId);
			
			fn('Container ' + containerId + ' did not find');
			return;
		}
		
		//try to stop the container
		var container = this.docker.getContainer(containerId);
		
		container.stop(function (err, data) {
			if (err) {
				//TODO: check if the container is already stopped
				fn(err);
				return;
			}
			
			container.remove(fn);
		});
	}
	
	function createProducer() {
		/*
		this.docker.listContainers({all: true}, function(err, containers) {
			console.log('ALL: ' + containers.length);
			console.log(containers);
		});
		/**/
		
		var createOptions = containerCreationOptions();
		
		this.runContainer('producers', 'peter/kudo:0.1', ['node', 'app.js', '-p'], fs.createWriteStream('./producer.log'), createOptions, function (err, data, container) {
			console.log();
			console.log('createProducer:docker: END');
			console.log('createProducer:docker: data:');
			console.log(data);
		});
		
		/*
		this.docker.run('peter/kudo:0.1', ['node', 'app.js', '-p'], process.stdout, createOptions, function (err, data, container) {
			console.log();
			console.log('createProducer:docker: END');
			console.log('createProducer:docker: data:');
			console.log(data);
		}).on('container', function (container) {
			console.log();
			console.log('createProducer:docker: on container:');
			console.log(container);
		});
		/**/
	}
	
	function createConsumer() {
		var createOptions = containerCreationOptions();
		
		this.runContainer('consumers', 'peter/kudo:0.1', ['node', 'app.js', '-c'], fs.createWriteStream('./consumer.log'), createOptions, function (err, data, container) {
			console.log();
			console.log('createConsumer:docker: END');
			console.log('createConsumer:docker: data:');
			console.log(data);
		});
	}
	
	
	/**
	 * Execution / Initialization / Public properties
	 */
	
	baseSubModule = {
		checkQueue: checkQueue,
		
		emitter: new EventEmitter(),
		
		docker: new Docker(dockerConnection()),
		containers: containers,
		runContainer: runContainer,
		removeContainer: removeContainer,
		createProducer: createProducer,
		createConsumer: createConsumer
	};
	
	module.exports = baseSubModule;
	
	return baseSubModule;
}(baseKudo || {}));
