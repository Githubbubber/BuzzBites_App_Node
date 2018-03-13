"use strict";

$(document).ready(function() {
// Used by Materialize 
  $("#scroll-top").click(function() {
    $('html, body').animate({
        scrollTop: $(".navbar-wrapper").offset().top
    }, 300);
  });


// Used by Materialize for the accordion animation
  $('.collapsible').collapsible({
    accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
  });


// Used by Materialize for the parallax animation
  $('.parallax').parallax();

// Forms
  var signUpClick = $("li#signUpClick");
  var loginClick = $("li#loginClick");

  signUpClick.click(function() {
    $('#modal1').modal();
  });

  loginClick.click(function() {
    $('#modal2').modal();
  });

});
