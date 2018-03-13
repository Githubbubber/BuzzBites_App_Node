"use strict";

const jsdom = require("jsdom"); const dom = new jsdom.JSDOM(`<!DOCTYPE html>`); var $ = require("jquery")(dom.window);

var passkeys = require("./passkeys");	// var passkeys = "";  // Comment out for local testing
var express = require('express'), app = module.exports = express(), bodyParser = require('body-parser');

var mapsapi = (passkeys.MAPSAPI)? passkeys.MAPSAPI : process.env.MAPSAPI;
var client_id = (passkeys.CLIENT_ID)? passkeys.CLIENT_ID : process.env.CLIENT_ID;
var client_secret = (passkeys.CLIENT_SECRET)? passkeys.CLIENT_SECRET : process.env.CLIENT_SECRET;
var twitter_consumer_key = (passkeys.TWITTER_CONSUMER_KEY)? passkeys.TWITTER_CONSUMER_KEY : process.env.TWITTER_CONSUMER_KEY;
var twitter_consumer_secret = (passkeys.TWITTER_CONSUMER_SECRET)? passkeys.TWITTER_CONSUMER_SECRET : process.env.TWITTER_CONSUMER_SECRET;
var twitter_access_token = (passkeys.TWITTER_ACCESS_TOKEN)? passkeys.TWITTER_ACCESS_TOKEN : process.env.TWITTER_ACCESS_TOKEN;
var twitter_access_token_secret = (passkeys.TWITTER_ACCESS_TOKEN_SECRET)? passkeys.TWITTER_ACCESS_TOKEN_SECRET : process.env.TWITTER_ACCESS_TOKEN_SECRET;

// User info after a POST request
var userLocation = "";

// Foursquare endpoint, query keys, and values
var section 	= "section=trending"; 	//opennow = "openNow=1";
var limit 		= "limit=5", 			query = "query=restaurants", version = "v=20180101"; 
var foursqURL 	= "https://api.foursquare.com/v2/venues/explore?"+version+"&"+section+
				"&"+limit+"&"+query+"&client_id="+client_id+"&client_secret="+client_secret;
var foursquare_data_venueName 		= "", foursquare_data_venueType = "", foursquare_data_venueCheckIns = 0, count = 0;
var foursquare_data_venueAddress 	= [], foursquare_data_venuePhone = "", foursquare_data_venueLatLong = [], hashtags = [], restaurantsSorted = [];

// Twitter API module
var Twitter = require('twitter');
var client = new Twitter({
  consumer_key: twitter_consumer_key,
  consumer_secret: twitter_consumer_secret,
  access_token_key: twitter_access_token,
  access_token_secret: twitter_access_token_secret
});


app.engine('.html', require('ejs').__express);
app.use(bodyParser.json()); 						// for parsing any form params and API's data to application/json
app.use(bodyParser.urlencoded({ extended: true })); //form-urlencoded; for parsing application/xwww-
app.use(express.static(__dirname + '/public/'));
app.set('views', __dirname + '/public/views');
app.set('view engine', 'html'); 					// This avoids having to provide the extension to res.render()
app.use(function(req, res, next) { console.log(`${req.method} request for ${req.url}`); next(); });

// The permanent code
var doStuff = function(data) {
	for(var x = 0; x<data.length; ++x){ let c = data.charCodeAt(x); if(c >= 0 && c <= 31){ throw 'problematic character found at position ' + x; } }

	count = data["response"]["groups"][0]["items"].length;

	for (var x = 0; x < count; x++) {
		var venue = data["response"]["groups"][0]["items"][x]["venue"];
		
		if (JSON.stringify(venue["categories"][0]["name"]).toLowerCase().includes("restaurant")) {
			var person = new Object();
			person.restName = venue["name"];
			person.restType = venue["categories"][0]["name"].toLowerCase();
			person.checkIns = venue["stats"]["checkInsCount"];
			person.address 	= [ venue["location"]["formattedAddress"][0], venue["location"]["formattedAddress"][1] ];
			person.phone 	= venue["contact"]["formattedPhone"];
			person.latlong 	= [ venue["location"]["lat"], venue["location"]["lng"] ]
			person.hashtag 	= venue["name"].replace(/\W/g,'');

			restaurantsSorted.push(person); 
    		// console.log("Hello " + person);
		} else { console.log("Mkay: " + venue["name"]); } 
	}
		twitterSearch();      
		// restaurantsSorted.sort(function(a,b){return b.checkIns - a.checkIns}); // Sort restaurants by checkin amount
}

function twitterSearch(){
	for (var x = 0; x < restaurantsSorted.length; x++) {
		var params = {result_type: 'mixed', count: '25', q: restaurantsSorted[x]["hashtag"]};
		// console.log("The hashtag is " + restaurantsSorted[x]["hashtag"]);
		client.get('search/tweet', params, function(error, tweets, response) {
			// console.log("The tweet is " + JSON.stringify(tweets["statuses"]));
			if (!error) { restaurantsSorted[x]["tweet"] = JSON.stringify(tweets["statuses"][0]["text"]); } else { //throw error; 
			}
		});
	}
}

app.get('/', function(req, res){ res.render('index', { info: `<h1><em>HI!<em><h1>` }); }); // console.log("Home page"); 
 
app.post('/', function(req, res){
	userLocation = (req.body.searchNear)? "&near=" + req.body.searchNear : "";
	userLocation = ((userLocation === "") && req.body.lat_lot)? "&ll="+req.body.lat_lot : "&ll=40.6494,-73.95";
	foursqURL +=  userLocation;
	
	$.ajax({ method: "GET", url: foursqURL, dataType: "json" })
    .done(function(data) { 
    	doStuff(data); 
    	// searchNear = ;
		res.render('index', { info: 
									"Restaurants around " + req.body.searchNear + "with Buzz: \n" + 
									JSON.stringify(restaurantsSorted[0]["restName"]) + 
									`<div id="accordion">
										  <h3>Section 1</h3>
										  <div>
										    <p>Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque. Vivamus nisi metus, molestie vel, gravida in, condimentum sit amet, nunc. Nam a nibh. Donec suscipit eros. Nam mi. Proin viverra leo ut odio. Curabitur malesuada. Vestibulum a velit eu ante scelerisque vulputate.</p>
										  </div>
										  <h3>Section 2</h3>
										  <div>
										    <p>Sed non urna. Donec et ante. Phasellus eu ligula. Vestibulum sit amet purus. Vivamus hendrerit, dolor at aliquet laoreet, mauris turpis porttitor velit, faucibus interdum tellus libero ac justo. Vivamus non quam. In suscipit faucibus urna. </p>
										  </div>
										  <h3>Section 3</h3>
										  <div>
										    <p>Nam enim risus, molestie et, porta ac, aliquam ac, risus. Quisque lobortis. Phasellus pellentesque purus in massa. Aenean in pede. Phasellus ac libero ac tellus pellentesque semper. Sed ac felis. Sed commodo, magna quis lacinia ornare, quam ante aliquam nisi, eu iaculis leo purus venenatis dui. </p>
										    <ul>
										      <li>List item one</li>
										      <li>List item two</li>
										      <li>List item three</li>
										    </ul>
										  </div>
										  <h3>Section 4</h3>
										  <div>
										    <p>Cras dictum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aenean lacinia mauris vel est. </p><p>Suspendisse eu nisl. Nullam ut libero. Integer dignissim consequat lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. </p>
										  </div>
									</div>`
							}); 
	})
	.fail(function(err) { 
		console.log("There's an error: " + JSON.stringify(err)); 
		res.render('index', { info: 'Sorry! Info retrieval failed. \nPlease try again soon.' });
	});
});

// Everything else 
app.get('/*', function(req, res) { res.status(404).render('error'); });
if (!module.parent) { app.listen(8080); console.log('EJS Demo server started on port 8080'); }