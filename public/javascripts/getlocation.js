"use strict";

$(document).ready(function() {
	// var buttonZS = $("button#searchNearSubmit");
	var formSearchNear = $('input#searchNear');
	var displayData = $("ul#displayData");
	var locationTitle = $('h5#location-title em');
	var latLotData = $("input#lat_lot");
	var searchNear = 0, lat_lot = "", myLatitude = 0, myLongitude = 0;

  	// console.log("Loading geolocation js");
	var getLocation = function() {
  		// console.log("Testing for geolocation");
		// displayData.empty();                        // Clears the restaurants list
      	if (navigator.geolocation) {
  			// console.log("We got geolocation!");
        	navigator.geolocation.getCurrentPosition(showPosition);
      	}
  	}();

	function googleMAPS() {
	    searchNear = formSearchNear.val();  // The user's given place
	    latLotData.attr("value", lat_lot);
  		// console.log("The latLotData value attribute passed is " + latLotData.val());
	}
	
	function showPosition(position) {
		myLatitude = position.coords.latitude;      // Latitude and longitude variables
		myLongitude = position.coords.longitude;
		lat_lot = myLatitude.toFixed(4) + "," + myLongitude.toFixed(2); // Foursquare query use
  		// console.log("The coordinates are " + myLatitude + " and " + myLongitude + ", so the Lat_Lot is "+ lat_lot);
		googleMAPS();
	}
});