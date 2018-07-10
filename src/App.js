import React from 'react'
import { Route } from 'react-router-dom'
import * as PlacesAPI from './PlacesAPI.js'
import './App.css'
import MainComponent from './MainComponent'

class MapsApp extends React.Component {
  state = {
    placesList: PlacesAPI.locations,
    markers: []
  }
  
  componentWillMount () {
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?libraries=places,geometry,drawing&key=AIzaSyAldCTjr02LfSu47jQGalmM_ETKPkBNQiM&v=3&callback=initMap";
    script.async = true;
    document.body.appendChild(script);
  }
  
  makeMarkerIcon = (markerColor) => {
    var markerImage = new window.google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new window.google.maps.Size(21, 34),
      new window.google.maps.Point(0, 0),
      new window.google.maps.Point(10, 34),
      new window.google.maps.Size(21,34));
    return markerImage;
  }

  //hides the markers
  hideMarkers = (markers) => {
    for (var i = 0; i < this.state.markers.length; i++) {
      this.state.markers[i].setMap(null);
    }
  }

  showListings = () => {
    var bounds = new window.google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < this.state.markers.length; i++) {
      this.state.markers[i].setMap(window.map);
      bounds.extend(this.state.markers[i].position);
    }
    window.map.fitBounds(bounds);
  }

  displayLocations = (poi) => {
    this.hideMarkers(this.state.markers)
    this.state.markers = []
    if (poi.length === 0) {
      window.alert('We did not find any places matching that search!');
      return;
    }
    var largeInfowindow = new window.google.maps.InfoWindow();

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = this.makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = this.makeMarkerIcon('FFFF24');

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < poi.length; i++) {
      // Get the position from the location array.
      var position = poi[i].location;
      var title = poi[i].title;
      // Create a marker per location, and put into markers array.
      var marker = new window.google.maps.Marker({
        position: position,
        title: title,
        animation: window.google.maps.Animation.DROP,
        icon: defaultIcon,
        id: i
      });
      // Push the marker to our array of markers.
      this.state.markers.push(marker);
      // Create an onclick event to open the large infowindow at each marker.
      marker.addListener('click', function() {
        this.populateInfoWindow(this, largeInfowindow, position);
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
    this.showListings()
    if(this.state.markers.length === 1){
        this.populateInfoWindow(this.state.markers[0], largeInfowindow, position)
    }
  }

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
populateInfoWindow = (marker, infowindow, position) => {
  // Check to make sure the infowindow is not already opened on this marker.
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

  render() {
    return (
      <main >

        <Route exact path='/' render={() => (
          <MainComponent
            displayLocations={this.displayLocations}
            places={this.state.placesList}
          />
        )}/>

      </main>
    )
  }
}

export default MapsApp