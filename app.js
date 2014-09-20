/*
	Here's a little ditty about finding an iPhone available for pickup...
*/

var querystring = require('querystring'),
        http = require('http'),
        url = require('url');

var zip = '98033';
var part = 'MG5A2LL/A';
var referer = 'http://store.apple.com/us/buy-iphone/iphone6/4.7-inch-display-64gb-space-gray-t-mobile';
var stateFilter = '';

var queryObj = {
	"parts.0": part,
	"zip": zip
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

var req = http.request(httpOptions, function(res) {
  res.setEncoding('utf-8');
  var resString = '';

  res.on('data', function(data) {
    resString += data;
  });

  res.on('end', function() {
    var resJson = JSON.parse(resString);
    //console.log('resJson:', resJson);
    renderAvailability(resJson);
  });
}).on('error', function(e) {
  console.log("error in request");
}).end();

function renderAvailability(json) {
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

	// foreach store:
	// 	If available render store info:
	// :if no stores had anything explain stats: Out of 87 stores 1 has the part XXX available.
	
	if (!json.body || !json.body.stores) {
		console.log("No body or no stores in response. Invalid data.");
		return;
	}
	if (!json.body.success) {
		console.log("Server error: Failed to return valid data.");
		return;
	}
	var stores = json.body.stores;
	var found=0;
	stores.forEach(function(store, storeIndex){
		var parts = store.partsAvailability;
		for (var partName in parts) {
			var partObj = parts[partName];
			if (partObj.storeSelectionEnabled && storeMeetsCriteria(store)) {
				found++;
				console.log('Item ' + partName + ' available at store ' + store.storeDisplayName + ' in ' + store.city + ', ' + store.state + '.');
			}
		}
	});
	console.log('Searched ', stores.length, ' stores and found ', found, ' items available.');
}

function storeMeetsCriteria(store) {
	if (stateFilter != null && stateFilter.length > 0) {
		if (stateFilter != store.state)
			return false;
	}
	return true;
}