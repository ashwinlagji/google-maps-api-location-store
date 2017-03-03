require('../css/styles.scss');
var random_places = [
        ['PSL Goa', 15.365781, 73.932871]
        , ['PSL Pune', 18.507165, 73.834090]
    ];

function initialize() {
    var center_initial_map = {
        lat: 17.469711
        , lng: 75.467188
    };
    var markers = [];
    var geocoder = new google.maps.Geocoder();
    var map = new google.maps.Map(document.getElementById('map-canvas'), {
        mapTypeId: google.maps.MapTypeId.ROADMAP
        , zoom: 6
        , center: center_initial_map
    });
    // Show initial location at Sydney — can be changed to detect user location
    //    var defaultBounds = new google.maps.LatLngBounds(
    //        new google.maps.LatLng(20.724029, 77.899577),
    //        new google.maps.LatLng(20.724029, 77.899577));
    //    map.fitBounds(defaultBounds);
    //getting default location of user
    // Try HTML5 geolocation.
    var infoWindow = new google.maps.InfoWindow({
        map: map
    });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude
                , lng: position.coords.longitude
            };
            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            map.setCenter(pos);
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    }
    else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
    }
    //END location of user
    //different types of maps
    function CoordMapType(tileSize) {
        this.tileSize = tileSize;
    }
    CoordMapType.prototype.maxZoom = 19;
    CoordMapType.prototype.name = 'Satelite';
    CoordMapType.prototype.alt = 'satellite view';
    CoordMapType.prototype.getTile = function (coord, zoom, ownerDocument) {
        var div = ownerDocument.createElement('div');
        div.innerHTML = coord;
        div.style.width = this.tileSize.width + 'px';
        div.style.height = this.tileSize.height + 'px';
        div.style.fontSize = '10';
        div.style.borderStyle = 'solid';
        div.style.borderWidth = '1px';
        div.style.borderColor = '#AAAAAA';
        div.style.backgroundColor = '#E5E3DF';
        return div;
    };
    map.addListener('maptypeid_changed', function () {
        var showStreetViewControl = map.getMapTypeId() !== 'coordinate';
        map.setOptions({
            streetViewControl: showStreetViewControl
        });
    });
    // Now attach the coordinate map type to the map's registry.
    map.mapTypes.set('coordinate', new CoordMapType(new google.maps.Size(256, 256)));
    var styles = [{
        featureType: "all"
        , elementType: "labels"
        , stylers: [
            {
                visibility: "on"
            }
        ]
    }];
    map.setOptions({
        styles: styles
    });
    var input = /** @type {HTMLInputElement} */ (document.getElementById('pac-input'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    var searchBox = new google.maps.places.SearchBox(
        /** @type {HTMLInputElement} */
        (input));
    
    
    /** adding a marker on map on click 
    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng);
    });

    function placeMarker(location) {
        var marker = new google.maps.Marker({
            position: location, 
            map: map
        });
    }
       end adding marker on map **/
    
    
    // [START region_getplaces]
    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.
    google.maps.event.addListener(searchBox, 'places_changed', function () {
        var places = searchBox.getPlaces();
        for (var i = 0, marker; marker = markers[i]; i++) {
            marker.setMap(null);
        }
        // For each place, get the icon, place name, and location.
        markers = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0, place; place = places[i]; i++) {
            var image = {
                url: place.icon
                , size: new google.maps.Size(71, 71)
                , origin: new google.maps.Point(0, 0)
                , anchor: new google.maps.Point(17, 34)
                , scaledSize: new google.maps.Size(25, 25)
            };
            // Create a marker for each place.
            var marker = new google.maps.Marker({
                map: map
                , //                icon: image,
                title: place.name
                , position: place.geometry.location
            });
            markers.push(marker);
            bounds.extend(place.geometry.location);
            infoWindow.setPosition(place.geometry.location);
            if (marker.formatted_address) {
                infoWindow.setContent(marker.formatted_address + "<br>coordinates: " + marker.getPosition().toUrlValue(6));
            }
            else {
                infoWindow.setContent(place.name + "<br>coordinates: " + marker.getPosition().toUrlValue(6));
            }
            infoWindow.open(map, marker);
            map.setCenter(place.geometry.location);
            google.maps.event.addListener(marker, 'click', function () {
                infoWindow.setContent(marker.getTitle() + "<br>coordinates: " + marker.getPosition().toUrlValue(6));
                infoWindow.open(map, this);
            });
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            }
            else {
                map.setCenter(place.geometry.location);
                map.setZoom(5); // Why 17? Because it looks good.
            }
        }
    });
    // [END region_getplaces]
    var place_markers = [];
    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    // Make markers show if they are inside visible bounds
    google.maps.event.addListener(map, 'bounds_changed', function () {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
        // Remove out of bounds markers
        for (var k = 0; k < place_markers.length; k++) {
            var one_marker = place_markers[k];
            if (!bounds.contains(one_marker.getPosition())) {
                one_marker.setMap(null);
            }
        }
        // Create markers which should be visible
        for (var i = 0; i < random_places.length; i++) {
            var placeLatLng = random_places[i];
            var myLatLng = new google.maps.LatLng(placeLatLng[1], placeLatLng[2]);
            if (bounds.contains(myLatLng)) {
                var marker = new google.maps.Marker({
                    position: myLatLng
                    , map: map
                    , title: placeLatLng[0]
                , });
                place_markers.push(marker);
                google.maps.event.addListener(marker, 'click', function () {
                    infoWindow.setContent(marker.getTitle() + "<br>coordinates: " + marker.getPosition().toUrlValue(6));
                    infoWindow.open(map, this);
                });
            }
        };
        // end places markers
        
        
        
        
        var searchPlaceBasedOnText = function () {
            //Place Details Service
            var infowindow = new google.maps.InfoWindow();
            var service = new google.maps.places.PlacesService(map);
            service.getDetails({
                placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4'
            }, function (place, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    var marker = new google.maps.Marker({
                        map: map
                        , position: place.geometry.location
                    });
                    google.maps.event.addListener(marker, 'click', function () {
                        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + 'Place ID: ' + place.place_id + '<br>' + place.formatted_address + '</div>');
                        infowindow.open(map, this);
                    });
                }
            });
            //END Place Details Service
        }
    });
}
google.maps.event.addDomListener(window, 'load', initialize);