import GoogleMapReact from 'google-map-react';
import React, { Component } from 'react';
import Marker from './Marker';
import { IUbs } from './IUbs';

export default class GoogleMaps extends Component {
  state = {
    center: {
      lat: 0,
      lng: 0
    },
    zoom: 0,
    ubsList: []
  };

  constructor(props: any) {
    super(props);
    this.load();
  }

  private load() {
    const geo = navigator.geolocation;
    const onChange = (coords: any) => {
      console.log(coords);
      const lat = coords.coords.latitude;
      const lng = coords.coords.longitude;
      this.setState({
        center: { lat: lat, lng: lng },
        zoom: 13
      });
      this.loadUbs(lat, lng);
    };
    const onError = (error: any) => {
      console.error(error.message);
    };
    const settings = {
      enableHighAccuracy: false,
      timeout: Infinity,
      maximumAge: 0
    };
    if (geo) {
      geo.getCurrentPosition(onChange, onError, settings);
    }
  }

  private loadUbs(lat: number, lng: number) {
    const url = `http://localhost:8080/api/v1/ubs?query=${lat},${lng},10&page=0&size=1000`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const _ubsList = data._embedded.ubsDtoes;
        console.log('load');
        _ubsList.forEach((_ubs: any) => {
          const ubs: IUbs = _ubs.content;
          console.log(ubs);
          this.setState({
            ubsList: [
              ...this.state.ubsList,
              {
                id: ubs.id,
                name: ubs.name,
                geocode: {
                  latitude: ubs.geocode.latitude,
                  longitude: ubs.geocode.longitude
                }
              }
            ]
          });
        });
      })
      .catch(console.log);
  }

  private addMarkers() {
    const { ubsList } = this.state;
    const list = ubsList.map((ubs: IUbs) => (
      <Marker
        key={ubs.id}
        lat={ubs.geocode.latitude}
        lng={ubs.geocode.longitude}
        name={ubs.name}
        color="blue"
      />
    ));
    const { center } = this.state;
    list.push(
      <Marker
        key="0"
        lat={center.lat}
        lng={center.lng}
        name="SEU LOCAL"
        color="red"
      />
    );
    return list;
  }

  render() {
    return (
      <div style={{ height: '100vh', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'AIzaSyCw1D3qmtsgfOieUg53ViNhuR4rD4uiJVo' }}
          center={this.state.center}
          zoom={this.state.zoom}
        >
          {this.addMarkers()}
        </GoogleMapReact>
      </div>
    );
  }
}
