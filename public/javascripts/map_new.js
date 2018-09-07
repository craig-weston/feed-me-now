let pos = {
    lat: parseFloat(sessionStorage.lat),
    lng: parseFloat(sessionStorage.lng),
};
function initMap() {

        map = new google.maps.Map(document.getElementById('map'), {
            center: pos,
            zoom: 14,
            streetViewControl: false
        });
        //sets the marker of blue circle to show where you are
        let marker = new google.maps.Marker({
            position: pos,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: 'blue',
                fillOpacity: 0.3,
                scale: 20,
                strokeColor: 'blue',
                strokeWeight: 1,
                zIndex: 1
            },
            draggable: true
        });
        marker.setMap(map);
        //calls the add restaurants function
        initRestaurants(map);

        /*map.addListener('dragend', function () {
            console.log('dragged');
            $.post('/map', {
                lat: map.getCenter().lat(),
                lng: map.getCenter().lng(),

            });
            initRestaurants(map);
        });*/

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
        map: map,
        icon: createMarkerStars(restaurant)
    });

    var infoWindow = generateInfoWindow(restaurant);
    var infoWindowBig = generateInfoWindowBig(restaurant);
    var openInfoWindow = () => {
        infoWindow.close();
        infoWindowBig.close();
        infoWindow.open(map, marker);
    };
    var closeInfoWindow = () => {
        infoWindow.close();
    };
    var openInfoWindowBig = () => {
        infoWindow.close();
        infoWindowBig.open(map, marker);
    };
    var closeInfoWindowBig = () => {
        infoWindow.close();
        infoWindowBig.close();
    };

    google.maps.event.addListener(marker, 'mouseover', openInfoWindow);
    google.maps.event.addListener(marker, 'mouseout', closeInfoWindow);
    google.maps.event.addListener(marker, 'click', openInfoWindowBig);
    google.maps.event.addListener(map, "click", closeInfoWindowBig);
    google.maps.event.addListener(marker, "touchstart", openInfoWindow);
    google.maps.event.addListener(marker, "touchend", closeInfoWindow);

}

function generateInfoWindow(restaurant) {
    return new google.maps.InfoWindow({
        content: buildIWContentSmall(restaurant)
    });
}
function generateInfoWindowBig(restaurant) {
    return new google.maps.InfoWindow({
        content: buildIWContentBig(restaurant)
    });
}

function buildIWContentSmall(restaurant) {
    return `
    <div class="iw-url">${restaurant.name}</div>
    `;

}

function buildIWContentBig(restaurant) {
    return `
    <div class="iw-icon"><img class="photo" src="${restaurant.icon}"/></div>
    <div class="iw-url">
        <b><a href="/map/${restaurant.place_id}">${restaurant.name}</a></b>
    </div>
    <div class="iw-address">${restaurant.vicinity}</div>
    ${rating(restaurant)}
    
    `;

}
function phone(restaurant){
    if (restaurant.formatted_phone_number) {
        return `<div class="iw-phone">${restaurant.formatted_phone_number}</div>`;
    }
}

function rating(restaurant){
    let rating = [];
    if (restaurant.rating) {
        for (let i = 0; i < 5; i++) {
            if (restaurant.rating < (i + 0.5)) {
                rating.push('&#10025;');
            } else {
                rating.push('&#10029;');
            }
        }
        return `<div class="iw-rating">${rating.join(' ')}</div>`;
    }
}

//creates the markers with stars and adds default if no rating
function createMarkerStars(result) {
    let rating = Math.round(result.rating);
    let markerIcon;
    if (isNaN(rating)) {
        markerIcon = '../images/' + 'marker_default.png';
    } else {
        markerIcon = '../images/' + 'marker_' + rating + '.png';
    }
    return markerIcon;
}
