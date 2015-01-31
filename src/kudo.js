var kudo = ( function (kudoModule) {
	
	/**
	 * Module dependencies.
	 */
	var base = require('./kudoApp'),
		kue = require('kue'),
		inquirer = require('inquirer');
	
	kudoModule.BaseApp = base;
	
	/**
	 * Functionality / Private properties
	 */
	
	var maxKue = 100;
	
	var maxConsumers = 5;
	
	/**
	 * Execution / Initialization / Public properties
	 */
	
	kudoModule.BaseApp.emitter.on('check-inactive', function() {
		console.log('Event: check-inactive');
	});
	
	kudoModule.BaseApp.emitter.on('max-not-reached', function() {
		console.log('Event: max-not-reached');
		
		if (kudoModule.BaseApp.containers.consumers.length > 1) {
			kudoModule.BaseApp.removeContainer('consumers', kudoModule.BaseApp.containers.consumers[1], function (err, data) {
				if (err) console.log(err);
				console.log('consumer removed!');
			});
		}
		
	});
	
	kudoModule.BaseApp.emitter.on('max-reached', function() {
		console.log('Event: max-reached');
		
		if (kudoModule.BaseApp.containers.consumers.length < maxConsumers) {
			kudoModule.BaseApp.createConsumer();
		}
		
	});
	
	setInterval(function() {
		kudoModule.BaseApp.checkQueue(maxKue);
	}, 5000);
	
	//kudoModule.BaseApp.checkQueue(150);
	
	//kudoModule.BaseApp.createProducer();
	kudoModule.BaseApp.createConsumer();
	
	kue.app.listen(3000);
	//*
	var mainQuestion = [{
		type: 'list',
		name: 'Options',
		message: 'What do you want to do?',
		choices: [
			'Create Producer',
			'Remove Producer',
			new inquirer.Separator(),
			'Max elements in kue (default: 100)',
			'Max consumer creations (default: 5)'
		]
	}];
	
	function inquirerMainAnswers(answers) {
		switch (answers.Options) {
			case 'Create Producer':
				kudoModule.BaseApp.createProducer();
				break;
			case 'Remove Producer':
				inquirer.prompt({
					type: 'list',
					name: 'Remove',
					message: 'Which?',
					choices: kudoModule.BaseApp.containers.producers
				}, inquirerRemoveContainer);
				return;
			case 'Max elements in kue (default: 100)':
				break;
			case 'Max consumer creations (default: 5)':
				break;
		}
		
		inquirer.prompt(mainQuestion, inquirerMainAnswers);
	}
	
	function inquirerRemoveContainer(answers) {
		
		kudoModule.BaseApp.removeContainer('producers', answers.Remove, function (err, data) {
			if (err) console.log(err);
			
			inquirer.prompt(mainQuestion, inquirerMainAnswers);
		});
	}
	
	inquirer.prompt(mainQuestion, inquirerMainAnswers);
	/**/
	
	//create producer
	//remove producer
	//max to check kue
	//max creation consumers
	
	module.exports = kudoModule;
	
	return kudoModule;
}(kudo || {}));