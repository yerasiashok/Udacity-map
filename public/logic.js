var map;

// Create a new blank array for all the listing markers.
var markers = [];

// This global polygon variable is to ensure only ONE polygon is rendered.
var polygon = null;

// Create placemarkers array to use in multiple functions to have control
// over the number of places that show.
var placeMarkers = [];
var locations = [
    {id: 0, title: 'Wipro Infotech Ltd', location: {lat: 12.975498, lng: 77.599139}},
    {id: 1, title: 'Wipro Limited', location: {lat: 12.914930, lng: 77.603831}},
    {id: 2, title: 'Wipro', location: {lat: 12.906061, lng: 77.595797}},
    {id: 3, title: 'Wipro BPS Hyderadad', location: {lat: 17.463233, lng: 78.373450}},
    {id: 4, title: 'Wipro Vizag ', location: {lat: 17.737244, lng: 83.312235}},
    {id: 5, title: 'Wipro Limited Chennai', location: {lat: 12.909535, lng: 80.227160}},
    {id: 6, title: 'Wipro Technologies Kochi ', location: {lat: 10.016199, lng: 76.365412}},
    {id: 7, title: 'Wipro Limited Kochi ', location: {lat: 9.974885, lng: 76.300649}},
    {id: 8, title: 'Wipro Limited Pune ', location: {lat: 18.529534, lng: 73.842186}},
    {id: 9, title: 'Wipro Infotech Mumbai ', location: {lat: 19.121515, lng: 72.911932}},
    {id: 10, title: 'Wipro Kolkata ', location: {lat: 22.583011, lng: 88.430595}},
    {id: 11, title: 'Wipro Delhi', location: {lat: 28.645672, lng: 77.284676}},
    {id: 12, title: 'Wipro Indore ', location: {lat: 22.749010, lng: 75.801279}}
  ];

function initMap() {
  // Create a styles array to use with the map.
  console.log("inside initMap")
  var styles = [
    {
      featureType: 'water',
      stylers: [
        { color: '#19a0d8' }
      ]
    },{
      featureType: 'administrative',
      elementType: 'labels.text.stroke',
      stylers: [
        { color: '#ffffff' },
        { weight: 6 }
      ]
    },{
      featureType: 'administrative',
      elementType: 'labels.text.fill',
      stylers: [
        { color: '#e85113' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
        { color: '#efe9e4' },
        { lightness: -40 }
      ]
    },{
      featureType: 'transit.station',
      stylers: [
        { weight: 9 },
        { hue: '#e85113' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'labels.icon',
      stylers: [
        { visibility: 'off' }
      ]
    },{
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [
        { lightness: 100 }
      ]
    },{
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [
        { lightness: -100 }
      ]
    },{
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [
        { visibility: 'on' },
        { color: '#f0e4d3' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [
        { color: '#efe9e4' },
        { lightness: -25 }
      ]
    }
  ];

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 17.443175, lng: 78.373450},
    zoom: 3,
    styles: styles,
    mapTypeControl: false
  });

  // Create a searchbox in order to execute a places search
  //var searchBox = new google.maps.places.SearchBox(
      //document.getElementById('places-search'));
  // Bias the searchbox to within the bounds of the map.
  //searchBox.setBounds(map.getBounds());

  // These are the real estate listings that will be shown to the user.
  // Normally we'd have these in a database instead.
  displayLocations(locations)
}
function displayLocations(poi){
  hideMarkers(markers)
  markers = []
  var largeInfowindow = new google.maps.InfoWindow();

  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < poi.length; i++) {
    // Get the position from the location array.
    var position = poi[i].location;
    var title = poi[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });
    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }
  
  showListings()
  
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
var position = locations[marker.id].location;
var foursquareAddr;
  var info = '';
  if (infowindow.marker !== marker) {
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    var streetViewService = new window.google.maps.StreetViewService();
    var radius = 50;
    // In case the status is OK, which means the pano was found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
    fetch("https://api.foursquare.com/v2/venues/search?ll=" +position.lat+"," +position.lng + "&oauth_token=OIAF5Z3HZOL2HPF5IDJVCWALEF32MJX1IUBKOO1FT2PMBFFU&v=20180709")
      .then(res => res.json())
      .then(
        (result) => {
          foursquareAddr = result.response.venues[0].location;
          if (foursquareAddr.address)
            info = foursquareAddr.address + ",";
          if(foursquareAddr.city)
            info +=  foursquareAddr.city + ",";
          if(foursquareAddr.country)
            info += foursquareAddr.country; 
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        },
        (error) => {
          foursquareAddr = "Foursquare Not Responding"
        }
      )

    function getStreetView(data, status) {
      console.log("insude")
      if (status === window.google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = window.google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
          infowindow.setContent('<div>' + marker.title + '</div><div> <h4>'+ info +'</h4></div><div id="pano"></div>');
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 30
            }
          };
        var panorama = new window.google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div>' + marker.title + '</div><div> <h4>' + info + '</h4></div>' +
          '<div>No Street View Found</div>');
      }
    }
    // Use streetview service to get the closest streetview image within
    // 50 meters of the markers position
    // Open the infowindow on the correct marker.
    infowindow.open(window.map, marker);
  }
}

// This function will loop through the markers array and display them all.
function showListings() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// This function will loop through the listings and hide them all.
function hideMarkers(markers) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}
