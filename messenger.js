var	AWS = require('aws-sdk'),
	nconf = require('nconf');

module.exports = Messenger;

Messenger.ConfKeys = {
	SnsTopicArn: 'aws.sns.TopicArn'
};

Messenger.isAWSInitialized = false;
function initAWS() {
	if (!Messenger.isAWSInitialized) {
		AWS.config.loadFromPath('./aws-sdk-secrets.json');
		Messenger.isAWSInitialized = true;
	}
};

Messenger.isConfigLoaded = false;
function loadConfig() {
	if (!Messenger.isConfigLoaded) {
		nconf.argv()
			.env()
			.file({ file: 'messenger-config.json' });
		Messenger.isConfigLoaded = true;
	}

};

function Messenger() {
	if (!(this instanceof Messenger)) return new Messenger();
	initAWS();
	loadConfig();

	this.saveDefaultConfig = function() {
		nconf.set(Messenger.ConfKeys.SnsTopicArn, 'arn:aws:sns:YOURREGION:SOMENUMBER:YOURTOPICNAME');
		nconf.save();
	};
	this.sendSMS = function(msg) {
		var sns = new AWS.SNS();
		var params = {
			Message: msg, /* required */
			TopicArn: nconf.get(Messenger.ConfKeys.SnsTopicArn)
		};

		var request = sns.publish(params, function(err, data) {
			if (err){
				// error response
				console.log(err, err.stack);
			} 
			else {
				// successful response
				//console.log(data);
				console.log('sent text message');
			}
		});
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
