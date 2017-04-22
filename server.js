"use strict";
/*
	Here's a little ditty about finding an iPhone available for pickup...
*/
const querystring = require('querystring'),
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
		// models['iphone-6']['tmobile']['gold']['64'],
		// models['iphone-6']['tmobile']['silver']['64']        
		//models['iphonese']['unlocked']['gray']['64'],
		//models['iphonese']['unlocked']['gold']['64'], 
		//models['iphonese']['unlocked']['silver']['64'],
		//models['iphonese']['tmobile']['silver']['64'],
		//models['iphonese']['tmobile']['gold']['64']
		models['airpods']['white']
	],
	stateFilter: 'WA'
};
findMyIPhoneLoop(loopOptions);


var waitingIndicatorTimer;

const SECONDS = 1000;
const MINUTES = SECONDS * 60;

const STOCK_CHECK_DELAY = MINUTES*5;
//const STOCK_CHECK_DELAY = SECONDS*5;

function findMyIPhoneLoop (searchOptions) {
	if (waitingIndicatorTimer != null) {
		clearTimeout(waitingIndicatorTimer);
		process.stdout.write(os.EOL);
	}
	util.log('Beginning search for:\n • %s...', searchOptions.parts.map((part) => models.prettyNameFromModel(part)).join('\n • '));
	findMyIPhone(searchOptions)
	.then(function (foundPhones) {
        if (foundPhones && foundPhones.length > 0) {
            var messageLines = foundPhones.map((foundPhone) => {
                //return models.prettyNameFromModel(foundPhone.name) + ' (' + foundPhone.name + ')' + ' available at ' + foundPhone.store.name + ' in ' + foundPhone.store.city + ', ' + foundPhone.store.state; 
								return models.prettyNameFromModel(foundPhone.name) + ' (' + foundPhone.name + ') ' + foundPhone.store.availabilitySummary;
            });
            util.log(messageLines.join('\n'));
            messenger.sendNotification(messageLines);
        } else {
			util.log('No phones found in stores.');
		}
	}, function(err) {
		var msg = 'Error performing search:' + err; 
		util.log(msg);
        messenger.sendNotification(msg);
	})
	.fin(function() {// fin=finally
		// restart the loop:
		process.stdout.write('Waiting ' + STOCK_CHECK_DELAY/SECONDS + ' seconds.');
		setTimeout(function () {findMyIPhoneLoop(searchOptions)}, STOCK_CHECK_DELAY);

		var dotToConsole = function() {
			process.stdout.write('.');
			waitingIndicatorTimer = setTimeout(dotToConsole, SECONDS*1);
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
		"location": searchOptions.zip
	};
	for (var idx=0; idx < searchOptions.parts.length; idx++) {
		queryObj["parts." + idx.toString()] = searchOptions.parts[idx];
	}
  //CURL;
	//curl 'https://www.apple.com/shop/retail/pickup-message?parts.0=MN8M2LL%2FA&location=98033&cppart=UNLOCKED%2FUS' -H 'Cookie: dssid2=bdcf7f2b-9dd1-4673-afc1-346e90baecdc; dssf=1; optimizelyEndUserId=oeu1488313331922r0.30647700400489586; xp_ci=3z4OUELAzFgbz4Y6zB9Pz19HcHVK9r; POD=us~en; geo=US; ccl=nEpAnP+DZWBxjB2I9dLCts3qNmnVaFaugc/v8BegYco=; s_invisit_n2_us=3%2C0; pxro=1; as_rec=SA4JCY2Y2KA2UJ4T24KYTDUACFFTDDPA279CXCDFKC49YJDHU; as_disa=SCYT9KAHKUK27F2K7CDKT92TKF7U2C9PCUADKC7TPDC2KDUJ4UHCCPTUCFUDYKUDTFJXUYHCDDU9UDT2U9DPK7CAPJ2AJ7HX9K4DK9FF7PJX7TDDYTKTTJUFXYHT7AXYHDYJ2HPAFUAACXDFY; as_cn=U2NvdHQ=~958ee768d5caff544f890ca343686dd9159a013aaa517662d3e88e78418bf026; as_metrics=%257B%2522store%2522%253A%257B%2522sid%2522%253A%2522wHF2F2PHCCCX72KDY%2522%257D%257D; as_loc=ac1da67aac8559d101d77dba3d031c7b5adb7354ab93ed6cdb031f2198cf4ca84c823fc8127025f0ba016ebe6b6abfba51746d26414aaa8ed0ae3d8901c66f5e028539920c4b46ae4765f5628560bcd20f866d5e672086084b1bc2cdfcc4f877; as_ltn_us=1aos7sFE1HIqJF2%2BIHS0UrBxLh0zNkGErRu%2BGQuKoWF3m9z9PsZRNv43MbsJe4LmK%2BPpmaOV7abuex4xyovV2/35dt13xYd5JjMxs9EHev1JHY06QnMbM2WE7%2BEWFXJs/HPYHTSvX1MAvhE%2BXTbHhtswHeyvAjNCV8AK1piCkmc6cjh5XdOOyyEnoF4zvE4VbwsHbAKHzY0UWXRtpOnU6G58jA%3D%3D; s_vnum_n2_us=19%7C2%2C4%7C7%2C3%7C2%2C1%7C1%2C0%7C2; s_pathLength=homepage%3D1%2Cairpods%3D1%2Ciphone.tab%2Bother%3D1%2C; as_sfa=Mnx1c3x1c3x8ZW5fVVN8Y29uc3VtZXJ8aW50ZXJuZXR8MHwwfDE=; optimizelySegments=%7B%22341793217%22%3A%22referral%22%2C%22341794206%22%3A%22false%22%2C%22341824156%22%3A%22gc%22%2C%22341932127%22%3A%22none%22%7D; optimizelyBuckets=%7B%7D; as_metrics=%22%257B%2522store%2522%253A%257B%2522sid%2522%253A%2522wHF2F2PHCCCX72KDY%2522%257D%257D%22; s_cc=true; s_ppv=AOS%253A%2520home%2Fshop_iphone%2Ffamily%2Fiphone_7%2Fselect%2C100%2C38%2C3538%2C; as_dc=nc; s_fid=2710E70B47D77F87-26DEAEDA4589E0C1; s_sq=applestoreww%2Cappleglobal%2Capplestoreamr%2Capplestoreus%3D%2526pid%253DAOS%25253A%252520home%25252Fshop_iphone%25252Ffamily%25252Fiphone_7%25252Fselect%2526pidt%253D1%2526oid%253DSearch%2526oidt%253D3%2526ot%253DSUBMIT%26appleusiphonetab%3D%2526pid%253Diphone%252520-%252520index%25252Ftab%252520%252528us%252529%2526pidt%253D1%2526oid%253Dhttps%25253A%25252F%25252Fwww.apple.com%25252Fus%25252Fshop%25252Fgoto%25252Fiphone_7%25252Fselect%2526ot%253DA' -H 'DNT: 1' -H 'Accept-Encoding: gzip, deflate, sdch, br' -H 'Accept-Language: en-US,en;q=0.8' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36' -H 'Accept: application/json, text/javascript, */*; q=0.01' -H 'Referer: https://www.apple.com/shop/buy-iphone/iphone-7/4.7-inch-display-128gb-silver' -H 'X-Requested-With: XMLHttpRequest' -H 'Connection: keep-alive' --compressed
	
	var urlObj = {
		pathname: '/shop/retail/pickup-message',
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

	var req = http.request(httpOptions, function (res) {
		res.setEncoding('utf-8');
		var resString = '';
        if (res.statusCode != 200) {
            var msgError = util.format('Unexpected HTTP Status Code: %s - %s', res.statusCode, res.statusMessage);
            deferred.reject(new Error(msgError));
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
		util.log("No body or no stores in response. Invalid data:", json);
		return;
	}
	if (json.head.status != 200) {
		util.log("Server error: Failed to return valid data.");
		return;
	}
	var allStores = json.body.stores;
	//debugTrace(allStores);
	var foundParts = [];
	util.log('Searching %s stores near zip code %s...', allStores.length, searchOptions.zip);
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
						name: aStore.storeName,
						city: aStore.city,
						state: aStore.state,
						availabilitySummary: ''
					}
				};
				Object.keys(aStore.partsAvailability).forEach((model, index) => {
					var quote = aStore.partsAvailability[model].storePickupQuote;
					foundPart.store.availabilitySummary += 'available ' + quote;
					if (index > 0)
						foundPart.store.availabilitySummary += '\n';
				})
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