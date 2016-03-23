/*
	Here's a little ditty about finding an iPhone available for pickup...
*/
var querystring = require('querystring'),
        http = require('http'),
        url = require('url'),
        Q = require('q'),
        os = require('os'),
        util = require('util'),
        setTimeout = require('timers').setTimeout,
        clearTimeout = require('timers').clearTimeout,
        models = require('./models'),
        messenger = require('./messenger');

var loopOptions = {
	zip: '98033',
	parts: [
        /* 
		models['iphone-6']['tmobile']['gold']['64'], 
		models['iphone-6']['tmobile']['silver']['64']
        */
        models['iphonese']['unlocked']['gray']['64'],
		models['iphonese']['tmobile']['gold']['64'], 
		models['iphonese']['tmobile']['silver']['64']
        
	],
	stateFilter: 'WA'
};
findMyIPhoneLoop(loopOptions);


var waitingIndicatorTimer;
function findMyIPhoneLoop (searchOptions) {
	if (waitingIndicatorTimer != null) {
		clearTimeout(waitingIndicatorTimer);
		process.stdout.write(os.EOL);
	}
	util.log('Beginning search for:\n • %s...', searchOptions.parts.map((part) => models.prettyNameFromModel(part)).join('\n • '));
	findMyIPhone(searchOptions)
	.then(function (foundPhones) {
        var messageLines = foundPhones.map((foundPhone) => {
            return models.prettyNameFromModel(foundPhone.name) + ' (' + foundPhone.name + ')' + ' available at ' + foundPhone.store.name + ' in ' + foundPhone.store.city + ', ' + foundPhone.store.state; 
        });
        util.log(messageLines.join('\n'));
        util.log('Sending %s SMS messages to topic %s', messageLines.length, messenger.topicArn);
		messageLines.forEach( (msg) => { 
            messenger.sendSMS(msg).then(() => {}, (err) => util.log('error sending sms'));
		});
        
		if (foundPhones.length == 0) {
			util.log('None found.');
		}
	}, function(err) {
		var msg = 'Error performing search:' + err; 
		console.log(msg);
		messenger.sendSMS(msg).then(function () {}, function(err) {
			util.log('error sending sms');
		});
	})
	.fin(function() {// fin=finally
		// restart the loop:
		var seconds = 1000;
		var minutes = seconds*60;
		var delay = minutes*10;
		process.stdout.write('Waiting ' + delay/seconds + ' seconds.');
		setTimeout(function () {findMyIPhoneLoop(searchOptions)}, delay);

		var dotToConsole = function() {
			process.stdout.write('.');
			waitingIndicatorTimer = setTimeout(dotToConsole, seconds*1);
		};
		dotToConsole();
	})
	.done();
	
}

/*
	Searches for the product according to the specified options.
	Returns true if something was found.
	Options:
	 - zip
	 - part
	 - referrer (NOT NEEDED?)
	 - stateFilter
*/
function findMyIPhone(searchOptions) {
	var deferred = Q.defer();
	var queryObj = {
		"zip": searchOptions.zip
	};
	for (var idx=0; idx < searchOptions.parts.length; idx++) {
		queryObj["parts." + idx.toString()] = searchOptions.parts[idx];
	}
    
	var urlObj = {
		pathname: '/shop/retailStore/availabilitySearch',
		query: queryObj
	}

	var httpOptions = {
	  hostname: 'www.apple.com',
	  path: url.format(urlObj),
	  method: "GET",
	  headers: {
	  	"Host": 'www.apple.com',
	  	"User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0',
	  	"Accept": 'application/json, text/javascript, */*; q=0.01',
	  	"Accept-Language": 'en-US,en;q=0.5',
	  	//"Accept-Encoding": 'gzip, deflate',
	  	"DNT": 1,
	  	"X-Requested-With": 'XMLHttpRequest',
	  	"Referer": 'http://store.apple.com/us/buy-iphone/iphone6/4.7-inch-display-64gb-space-gray-t-mobile',
	  	"Connection": 'keep-alive'
	  }
	};

	//console.log('httpOptions:', httpOptions);

	var req = http.request(httpOptions, function (res) {
		res.setEncoding('utf-8');
		var resString = '';
        if (res.statusCode != 200) {
            deferred.reject(new Error(util.format('Unexpected HTTP Status Code (%s). Request failed.', res.statusCode)));
            return;
        }

		res.on('data', function(data) {
			resString += data;
		});

		res.on('end', function() {
			var resJson;
			try {
				resJson = JSON.parse(resString);
			} catch (eParse) {
				deferred.reject(new Error('Failed to parse json response.'));
                return;
			}

			deferred.resolve(parseAvailabilityResponse(resJson, searchOptions));
		});
	}).on('error', function(e) {
		console.log("error in request");
		deferred.reject(new Error('HTTP request failed:' + e));
	}).end();
	return deferred.promise;
}


/* Returns found products or an empty array if none found.
	part {
	 name: "",
	 store: {
	 	name: "",
	 	city: "",
	 	state: "",
	 }
	}
	Returns:
	 The complete list of found parts or an empty array if none found.
*/
function parseAvailabilityResponse(json, searchOptions) {
	/*
	key fields:
	body.success//true
	stores[n]
		.storeDisplayName		//"Apple Store, Chestnut Street"
		.city					//"San Francisco"
		.state					//"CA"
		.address.postalCode		//"94123"
		.partsAvailability["MG5A2LL/A"]
			storeSelectionEnabled	//false
			.pickupSearchQuote		//"Unavailable for Pickup"
	*/	
	if (!json || !json.body || !json.body.stores) {
		console.log("No body or no stores in response. Invalid data:", json);
		return;
	}
	if (!json.body.success) {
		console.log("Server error: Failed to return valid data.");
		return;
	}
	var allStores = json.body.stores;
	//debugTrace(allStores);
	var foundParts = [];
	console.log('Searching %s stores near zip code %s...', allStores.length, searchOptions.zip);
	for (var storeIndex=0; storeIndex < allStores.length; storeIndex++) {
		var aStore = allStores[storeIndex];
		var parts = aStore.partsAvailability;
		for (var partName in parts) {
			var partObj = parts[partName];
			//debugTrace(partObj);
			if (partObj.storeSelectionEnabled && storeMeetsCriteria(aStore, searchOptions)) {
				var foundPart = {
					name: partName,
					store: {
						name: aStore.storeDisplayName,
						city: aStore.city,
						state: aStore.state
					}
				};
				foundParts[foundParts.length] = foundPart;
			}
		}
	}
	return foundParts;
}

function storeMeetsCriteria(store, searchOptions) {
	if (searchOptions.stateFilter != null && searchOptions.stateFilter.length > 0) {
		if (searchOptions.stateFilter != store.state)
			return false;
	}
	return true;
}


function debugTrace(obj) {
	console.log(util.inspect(obj), {colors:true, depth:null})
}