
map_new.js

function initMap() {
    let pos = {
        lat: 39.5696,
        lng: 2.6502
    };

    map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 14,
        streetViewControl: false
    });


    initRestaurants(map);
}


function initRestaurants(map) {

    var restaurantDivs = document.getElementsByClassName('restaurant-info');

    for(var i=0; i < restaurantDivs.length; i++) {
        const restaurantDiv = restaurantDivs[i];
        const restaurant = JSON.parse(restaurantDiv.dataset.restaurant);
        showRestaurantInMap(restaurant);
    }




};

function showRestaurantInMap(restaurant) {

    var marker = new google.maps.Marker({
        position: restaurant.geometry.location,
        map: map
    });

    var infoWindow = generateInfoWindow(restaurant);
    var openInfoWindow = () => infoWindow.open(map, marker);
    var closeInfoWindow = () => infoWindow.close();

    google.maps.event.addListener(marker, 'mouseover', openInfoWindow);
    google.maps.event.addListener(marker, 'mouseout', closeInfoWindow);

}

function generateInfoWindow(restaurant) {
    return new google.maps.InfoWindow({
        content: buildIWContentSmall(restaurant)
    });
}

function buildIWContentSmall(restaurant) {
    console.log(restaurant)
    return `
    <h3>${restaurant.name}</h3>
    `;

}

map.pug

extends layout

block content

	main.container-fluid

		#search
			#locationField
				input#autocomplete-input(placeholder='Search by city', type='text')
				input#autocompleteRestaurant-input(placeholder='Search by Restaurant', type='text')
		.map-and-list
			.map-wrapper
				#map


			.info-wrapper
				#listing
					#results
						each restaurant in restaurants
							div.restaurant-info(data-restaurant=restaurant)
								a#iw-reviews(data-lat= restaurant.geometry.location.lat data-lng= restaurant.geometry.location.lng href=`/map/${restaurant.place_id}`) #{restaurant.name}
						#loading.loading
					button#more More results
			#info-content
				#iw-icon
				h3#iw-rating
				.extra-details
					#iw-url
					#iw-address
					#iw-phone
					#iw-website
					#iw-open
					a#iw-reviews(href=`/restaurant/${restaurant}`)
			#info-content-small
				#iw-icon-small
				h3#iw-rating-small
				.extra-details
					#iw-url-small



	script(src="/javascripts/map_new.js")
	script(src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBDucSpoWkWGH6n05GpjFLorktAzT1CuEc&callback=initMap', async = '', defer = '')


map.rooutes
var express = require('express');
var router = express.Router();

var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyCVXZ0vhPliqPIvwSUaSvZJ9XmcoJKtXaM'
});

let pos = {
    lat: 39.5696,
    lng: 2.6502,
};

router.get('/', function(req, res, next) {
    googleMapsClient.placesNearby({
        location: pos,
        radius: 500,
        type: 'restaurant'
    }, function(err, response) {
        if (!err) {
            console.log(response.json.results[0].geometry.location);
            res.render('map', {
                title: 'map',
                restaurants: response.json.results
            });
        }
    });
});

router.get('/:id', function(req, res, next) {
    googleMapsClient.place({
        placeid: req.params.id,
    }, function(err, response) {
        if (!err) {
            //console.log(response.json.result);
            res.render('restaurant', {
                place: response.json.result,
            });
        }
    });
});

module.exports = router;
