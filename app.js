/*
	Here's a little ditty about finding an iPhone available for pickup...
*/
var querystring = require('querystring'),
        http = require('http'),
        url = require('url'),
        Q = require('q'),
        os = require('os'),
        setTimeout = require('timers').setTimeout,
        clearTimeout = require('timers').clearTimeout;

var referer = 'http://store.apple.com/us/buy-iphone/iphone6/4.7-inch-display-64gb-space-gray-t-mobile';

var searchOptions = {
	zip: '98033',
	part: 'MG5A2LL/A',
	stateFilter: 'WA'
};

findMyIPhoneLoop();


var waitingIndicatorTimer;
function findMyIPhoneLoop () {
	
	if (waitingIndicatorTimer != null) {
		clearTimeout(waitingIndicatorTimer);
		process.stdout.write(os.EOL);
	}

	findMyIPhone(searchOptions)
	.then(function (foundPhones) {
		foundPhones.forEach(function (foundPhone) {
			console.log('Item ' + foundPhone.name + ' available at store ' + foundPhone.store.name + ' in ' + foundPhone.store.city + ', ' + foundPhone.store.state + '.');
		});
		if (foundPhones.length == 0) {
			console.log('None found.');
		}
		var seconds = 1000;
		var minutes = 1000*60
		var delay = 10*minutes;
		process.stdout.write('Waiting ' + delay/seconds + ' seconds.');
		setTimeout(findMyIPhoneLoop, delay);

		var dotToConsole = function() {
			process.stdout.write('.');
			waitingIndicatorTimer = setTimeout(dotToConsole, seconds*1);
		};
		dotToConsole();
	});
	
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
function findMyIPhone(findMyIPhoneOptions) {
	var deferred = Q.defer();
	var queryObj = {
		"parts.0": findMyIPhoneOptions.part,
		"zip": findMyIPhoneOptions.zip
	};
	var urlObj = {
		pathname: '/us/retailStore/availabilitySearch',
		query: queryObj
	}

	var httpOptions = {
	  hostname: 'store.apple.com',
	  path: url.format(urlObj),
	  method: "GET",
	  headers: {
	  	"Host": 'store.apple.com',
	  	"User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0',
	  	"Accept": 'application/json, text/javascript, */*; q=0.01',
	  	"Accept-Language": 'en-US,en;q=0.5',
	  	//"Accept-Encoding": 'gzip, deflate',
	  	"DNT": 1,
	  	"X-Requested-With": 'XMLHttpRequest',
	  	"Referer": referer,
	  	"Connection": 'keep-alive'
	  }
	};

	var req = http.request(httpOptions, function (res) {
		res.setEncoding('utf-8');
		var resString = '';

		res.on('data', function(data) {
			resString += data;
		});

		res.on('end', function() {
			var resJson = JSON.parse(resString);
			deferred.resolve(getFoundParts(resJson));
		});
	}).on('error', function(e) {
		console.log("error in request");
		deferred.reject(new Error('http error'));
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
function getFoundParts(json) {
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
	if (!json.body || !json.body.stores) {
		console.log("No body or no stores in response. Invalid data.");
		return;
	}
	if (!json.body.success) {
		console.log("Server error: Failed to return valid data.");
		return;
	}
	var allStores = json.body.stores;
	var foundParts = [];
	console.log('Searching ' + allStores.length + ' stores...');
	for (var storeIndex=0; storeIndex < allStores.length; storeIndex++) {
		var aStore = allStores[storeIndex];
		var parts = aStore.partsAvailability;
		for (var partName in parts) {
			var partObj = parts[partName];
			if (partObj.storeSelectionEnabled && storeMeetsCriteria(aStore)) {
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

function storeMeetsCriteria(store) {
	if (searchOptions.stateFilter != null && searchOptions.stateFilter.length > 0) {
		if (searchOptions.stateFilter != store.state)
			return false;
	}
	return true;
}

