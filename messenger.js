"use strict";
const AWS = require('aws-sdk'),
	nconf = require('nconf'),
	Q = require('q'),
    util = require('util'),
    crypto = require('crypto');

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

function createHash(message) {
    if (!(message && Array.isArray(message)))
        throw new TypeError('Invalid argument. Expected array.');
    let hash = crypto.createHash('sha256');
    message.forEach((line) => hash.update(line));
    return hash.digest('base64');
}

function Messenger() {
	if (!(this instanceof Messenger)) return new Messenger();
	initAWS();
	loadConfig();
    this.topicArn = nconf.get(ConfKeys.SnsTopicArn);
    const SECONDS = 1000;
    const MINUTES = SECONDS * 60;
    /** Delay duplicate notifications to occur no more than every N milliseconds */
    const notificationDelayMilliseconds = 90 * MINUTES;
    /** As part of delaying duplicate notifications, we track the hash of the last notification */
    this.lastNotificationHash = null;
    this.lastNotifyTime = Date.now() - notificationDelayMilliseconds; // first error will trigger a notification
    
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
			if (err) 
				deferred.reject(new Error(err));
			else 
				deferred.resolve(data);
		});
		return deferred.promise;
	};

    this.sendNotification = function (messageLines) {
        if (!(typeof messageLines === 'string' || Array.isArray(messageLines)))
            throw new TypeError('Invalid argument. Expected string or array');
        if (!Array.isArray(messageLines)) {
            messageLines = [messageLines];
        }
        var newHash = createHash(messageLines);
        var millisecondsSinceLastError = Date.now() - this.lastNotifyTime;
        util.log('%s minutes since last notification...', millisecondsSinceLastError / MINUTES);
        if (newHash != this.lastNotificationHash || millisecondsSinceLastError > notificationDelayMilliseconds) {
            messageLines.forEach( (msg) => { 
                this.sendSMS(msg).then(() => {}, (err) => util.log('error sending SMS: %s', err));
            });
            this.lastNotificationHash = newHash;
            this.lastNotifyTime = Date.now();
        } else {
            util.log('Notification is a duplicate of prior. Delaying this notification for %s more minutes. NOT sending notification.', (notificationDelayMilliseconds - millisecondsSinceLastError) / MINUTES );
        }
    }
};

