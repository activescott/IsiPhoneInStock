var AWS = require('aws-sdk');

sendSMS('permissions to group. No more two messages?')

function sendSMS(msg) {
	AWS.config.loadFromPath('./aws-sdk-secrets.json');
	var sns = new AWS.SNS();
	var params = {
		Message: msg, /* required */
		TopicArn: 'arn:aws:sns:us-east-1:166901232151:IsiPhoneInStock'
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
}


function sendEmail() {
	//http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-intro.html
	//http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html
	var params = {
		ToAddresses: [
		'STRING_VALUE'
		/* more items */
		],	  
		Message: { /* required */
			Body: { /* required */
				Html: {
					Data: 'STRING_VALUE', /* required */
					Charset: 'STRING_VALUE'
				},
				Text: {
					Data: 'STRING_VALUE', /* required */
					Charset: 'STRING_VALUE'
				}
			},
			Subject: { /* required */
				Data: 'STRING_VALUE', /* required */
				Charset: 'STRING_VALUE'
			}
		},
		Source: 'STRING_VALUE', /* required */
		ReplyToAddresses: [
		'STRING_VALUE',
		/* more items */
		],
		ReturnPath: 'STRING_VALUE'
	};
	ses.sendEmail(params, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else     console.log(data);           // successful response
	});
}