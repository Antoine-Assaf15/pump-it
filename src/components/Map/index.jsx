import React from 'react';
import './index.css';
import {
  Map, GoogleApiWrapper, Marker, InfoWindow,
} from 'google-maps-react';
import nearbySearch from '../../utils/api';

const { REACT_APP_API_KEY } = process.env;

class GMap extends React.Component {
  state = {
    userLatitude: null,
    userLongitude: null,
    conditionValue: null,
    conditionMaintenance: null,
    conditionBrand: null,
    showingInfoWindow: null,
    APIContent: null,
    selectedPlace: {},
    activeMarker: {},
    loading: false,
  };

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          userLatitude: position.coords.latitude,
          userLongitude: position.coords.longitude,
        });
      },
      error => console.log(error),
    );
  }

  onMarkerClick = (props, marker) => this.setState({
    selectedPlace: props,
    activeMarker: marker,
    showingInfoWindow: true,
  });

  onMapClicked = () => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null,
      });
    }
  };

  getInfo = (dropdownVal) => {
    if (
      (dropdownVal.maintenanceType
        && dropdownVal.brand
        && (dropdownVal.maintenanceType !== this.state.conditionMaintenance
          || dropdownVal.brand !== this.state.conditionBrand)
        && dropdownVal.maintenanceType !== 'Select'
        && dropdownVal.brand !== 'Brand')
      || (dropdownVal.values
        && dropdownVal.values !== this.state.conditionValue
        && dropdownVal.values !== 'Select')
    ) {
      if (this.state.loading === false) {
        this.setState({ loading: true });
      }
      this.fetchingInfo(dropdownVal);
    }
  };

  fetchingInfo(dropdownVal) {
    const apiContent = [];
    this.fetching(dropdownVal)
      .then(response => response.json())
      .then((json) => {
        json.results.map(response => apiContent.push(response));
        if (dropdownVal.brand) {
          this.setState({
            conditionMaintenance: dropdownVal.maintenanceType,
            conditionBrand: dropdownVal.brand,
            APIContent: apiContent,
            loading: false,
          });
        } else if (dropdownVal.values) {
          this.setState({
            conditionValue: dropdownVal.values,
            APIContent: apiContent,
            loading: false,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetching(dropdownVal) {
    if (dropdownVal.brand === 'Other') {
      dropdownVal.brand = 'Car';
    }
    return fetch(
      `${nearbySearch}${this.state.userLatitude}%20${this.state.userLongitude}&name=${
        dropdownVal.brand ? `${dropdownVal.brand}%20` : ''
      }${(dropdownVal.values && dropdownVal.values)
        || (dropdownVal.maintenanceType
          && dropdownVal.maintenanceType)}&radius=10000&key=${REACT_APP_API_KEY}`,
    );
  }

  render() {
    const { getDropDownValue } = this.props;
    this.getInfo(getDropDownValue);
    let markers;
    let infoWindows;
    let loadIcon;
    let locationAvailibilty;

    if (this.state.loading) {
      loadIcon = <div>Loading...</div>;
    }

    if (this.state.APIContent) {
      markers = this.state.APIContent.map((value, index) => (
        <Marker
          name={value.name}
          key={index}
          onClick={this.onMarkerClick}
          position={{
            lat: value.geometry.location.lat,
            lng: value.geometry.location.lng,
          }}
          rating={value.rating}
          place_id={value.place_id}
          opening_hours={value.opening_hours}
          user_ratings_total={value.user_ratings_total}
        />
      ));

      if (this.state.selectedPlace.position) {
        locationAvailibilty = (
          <a
            href={`http://maps.${
              navigator.userAgent.match(/iPhone/i)
              || navigator.userAgent.match(/iPad/i)
              || navigator.userAgent.match(/iPod/i)
                ? 'apple'
                : 'google'
            }.com/?q=${this.state.selectedPlace.position.lat},${
              this.state.selectedPlace.position.lng
            }`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Link
          </a>
        );
      }

      infoWindows = (
        <InfoWindow
          onClose={this.onInfoWindowClose}
          visible={this.state.showingInfoWindow}
          marker={this.state.activeMarker}
        >
          <div>
            <h2>{this.state.selectedPlace.name}</h2>
            <p>
              Rating:
              {` ${this.state.selectedPlace.rating}`}
              {' '}
Stars
            </p>
            <p>
              User Ratings Total:
              {` ${this.state.selectedPlace.user_ratings_total}`}
              {' '}
Person(s)
            </p>
            <p>
              Status:
              {' '}
              {this.state.selectedPlace.opening_hours
                ? 'Open'
                : this.state.selectedPlace.opening_hours === false
                  ? 'Çlosed'
                  : 'Unknown'}
            </p>
            {locationAvailibilty}
          </div>
        </InfoWindow>
      );
    }
    return (
      <div>
        {loadIcon}
        Flag: Your current location
        <div className="wrapMap">
          <Map
            google={this.props.google}
            onClick={this.onMapClicked}
            center={{
              lat: this.state.userLatitude,
              lng: this.state.userLongitude,
            }}
            zoom={12}
          >
            <Marker
              name="Your location"
              position={{
                lat: this.state.userLatitude,
                lng: this.state.userLongitude,
              }}
              icon={{
                url:
                  'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
              }}
            />

            {markers}
            {infoWindows}
          </Map>
        </div>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: REACT_APP_API_KEY,
})(GMap);
