#IsiPhoneInStock
Here's a little ditty about finding an iPhone available for pickup. Just because it's more fun to script something out.

##Features
- Searches for specified iPhone model near your zip code (very wide area) and reports findings in console.
- Repeats the search every 10 minutes (or whatever you specify).
- Can notify you via SMS of found models (requires you to setup AWS SNS topic).

##Todo

- + Send a text message when a product is found
- + Allow searching for multiple products
	- + Found output needs to indicate product
- - Put all hard-coded data from index.js into config.js.
	- if config.js is empty, prompt for values?
- - Make AWS SNS setup easier/more intuitive.
- - Web interface?
- - Rather than waiting an arbitrary duration and having a second timer to update display, refactor timer code to set a date+time to next check, and periodically (second?) see if that time has come, if so check. 
- - Slightly randomize the time between searches. why?
- - turn on gzip/deflate decoding in request/response.

