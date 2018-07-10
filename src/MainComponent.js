import React from 'react'
import PropTypes from 'prop-types'
import './App.css'
import * as MapStyles from './MapStyles.js'

class MainComponent extends React.Component { 
  static propTypes = {
    places: PropTypes.array.isRequired
    //mapinit : PropTypes.func.isRequired
  } 
  state = {
    filteredPlaces: this.props.places
  }
  onChangeFilter = (event) => {
    var updatedList = this.props.places;
    updatedList = updatedList.filter(function(item){
      return item.title.toLowerCase().search(
        event.target.value.toLowerCase()) !== -1;
    });
    this.setState({filteredPlaces: updatedList});
    this.props.displayLocations(updatedList);
  }
  closeNav = () => {
    document.getElementById("navigate").style.display='none';
    document.getElementById("map").style.left = "0px"; 
    document.getElementById("map").style.width = "100%";
  }
  openNav = () => {
    document.getElementById("navigate").style.display = "block";
    document.getElementById("navigate").style.width = "300px";
    document.getElementById("map").style.left = "310px"; 
    document.getElementById("map").style.width = "75%";
  }
  render() {
    return (  
      <div>
        <header id="mySidenav" className="sidenav">
          <span id="hamberger" onClick={() => this.openNav()}>&#9776;
            <b>WIPRO Offices</b>
          </span>
        </header>
        <nav className="options-box container" id="navigate" >
          <a href="javascript:void(0)" className="closebtn" onClick={() => this.closeNav()}>&times;</a>
          <div>
            <input id="places-search" type="text" aria-label="Places Search" placeholder="Ex: wipro limited" onChange={(e) => this.onChangeFilter(e)}/>
            <input id="go-places" aria-label="Filter Button" type="button" value="Filter"/>
          </div>
          <div>
            <ul>
              {this.state.filteredPlaces.map((place) => (
                <li key={place.title} > <a href="#" onClick={(e) => this.props.displayLocations([place])}>{place.title} </a></li>
              ))}
            </ul>
          </div>
        </nav>
      <div id="map" role="application">
      </div>
    </div>  

    )
  }
}
export default MainComponent
