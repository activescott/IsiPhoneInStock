var	AWS = require('aws-sdk'),
	nconf = require('nconf'),
	Q = require('q');


var ConfKeys = {
	SnsTopicArn: 'aws.sns.TopicArn'
};

var isAWSInitialized = false;
function initAWS() {
	if (!Messenger.isAWSInitialized) {
		AWS.config.loadFromPath('./aws-sdk-secrets.json');
		Messenger.isAWSInitialized = true;
	}
};

var isConfigLoaded = false;
function loadConfig() {
	if (!Messenger.isConfigLoaded) {
		nconf.argv()
			.env()
			.file({ file: 'messenger-config.json' });
		Messenger.isConfigLoaded = true;
	}
};

module.exports = new Messenger();

function Messenger() {
	if (!(this instanceof Messenger)) return new Messenger();
	initAWS();
	loadConfig();
    this.topicArn = nconf.get(ConfKeys.SnsTopicArn);
    
	this.saveDefaultConfig = function() {
		nconf.set(ConfKeys.SnsTopicArn, 'arn:aws:sns:YOURREGION:SOMENUMBER:YOURTOPICNAME');
		nconf.save();
	};
	// Sends the specified message and returns a promise.
	this.sendSMS = function(msg) {
		var deferred = Q.defer();
		var sns = new AWS.SNS();
		var params = {
			Message: msg, /* required */
			TopicArn: this.topicArn
		};

		var request = sns.publish(params, function(err, data) {
			if (err){
				// error response
				deferred.reject(new Error(err));
				console.log(err, err.stack);
			} 
			else {
				// successful response
				deferred.resolve(data);
			}
		});
		return deferred.promise;
	};
	/*
	this.sendEmail = function(from, to, subj, msgText, msgHtml) {
		//http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-intro.html
		//http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html

		var params = {
			ToAddresses: [
			'STRING_VALUE'
			// more items
			],	  
			Message: { // required
				Body: { // required
					Html: {
						Data: 'STRING_VALUE', // required 
						Charset: 'STRING_VALUE'
					},
					Text: {
						Data: 'STRING_VALUE', // required 
						Charset: 'STRING_VALUE'
					}
				},
				Subject: { // required 
					Data: 'STRING_VALUE', //required
					Charset: 'STRING_VALUE'
				}
			},
			Source: 'STRING_VALUE', // required 
			ReplyToAddresses: [
			'STRING_VALUE',
			// more items
			],
			ReturnPath: 'STRING_VALUE'
		};
		ses.sendEmail(params, function(err, data) {
		  if (err) console.log(err, err.stack); // an error occurred
		  else     console.log(data);           // successful response
		});
	}
	*/
};

