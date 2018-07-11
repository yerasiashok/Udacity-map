import React from 'react'
import { Route } from 'react-router-dom'
import * as PlacesAPI from './PlacesAPI.js'
import './App.css'
import MainComponent from './MainComponent'

class MapsApp extends React.Component {
  state = {
    placesList: PlacesAPI.locations
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

  hideAllMarkers = () => {
    for (var i = 0; i < window.markers.length; i++) {
      window.markers[i].setMap(null);
    };
  }

  showListingsOnly = (markers) => {
    var bounds = new window.google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(window.map);
      bounds.extend(markers[i].position);
    }
    window.map.fitBounds(bounds);
  }
  
  displayLocations = (places) => {
    if(!window.google){
      window.alert('Issue while loading the Map. \nCheck for Internet connectivity!!');
      return;
    }
    var markers = places.map(place => window.markers[place.id]) 
    this.hideAllMarkers()
    if (places.length === 0) {
      window.alert('We did not find any places matching that search!');
      return;
    }
    
    this.showListingsOnly(markers)    
    if(places.length === 1){
        this.populateInfoWindow(markers[0], window.largeInfowindow)
    }
  }

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
populateInfoWindow = (marker, infowindow) => {
  // Check to make sure the infowindow is not already opened on this marker.
  var position = this.state.placesList[marker.id].location;
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
          info += "OFFLINE!!!. Foursquare Not Responding"
          infowindow.setContent('<div>' + marker.title + '</div><div> <h2>' + info + '</h2></div>' )
        }
      ).catch(function(error) {
        info += "Foursquare Not Responding"
    });

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