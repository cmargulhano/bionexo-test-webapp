import { Icon } from 'leaflet';
import _ from 'lodash';
import React, { Component, createRef } from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import { IUbs } from './IUbs';

//const HOST = 'http://localhost:8080';
const HOST = 'https://ubs-microservice.herokuapp.com';

type State = {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  ubsList: IUbs[];
};

export const pointerIcon = new Icon({
  iconUrl: '/pointerIcon.svg',
  iconRetinaUrl: '/pointerIcon.svg',
  iconAnchor: [5, 55],
  popupAnchor: [10, -44],
  iconSize: [25, 55],
  shadowUrl: '/marker-shadow.png',
  shadowSize: [68, 95],
  shadowAnchor: [20, 92]
});

export const ubsIcon = new Icon({
  iconUrl: '/hospital.svg',
  iconRetinaUrl: '/hospital.svg',
  iconAnchor: [10, 50],
  popupAnchor: [10, -44],
  iconSize: [40, 40],
  shadowUrl: '/marker-shadow.png',
  shadowSize: [68, 95],
  shadowAnchor: [20, 92]
});

export default class OpenStreetMaps extends Component<{}, State> {
  state = {
    center: {
      lat: 0,
      lng: 0
    },
    zoom: 13,
    ubsList: []
  };
  mapRef = createRef<Map>();
  centerRef = createRef<Marker>();

  componentDidMount() {
    this.load();
  }

  updatePosition = () => {
    console.log(this.centerRef.current?.props.position);
    const marker = this.centerRef.current;
    if (marker != null) {
      const center = marker.leafletElement.getLatLng();
      const zoom = this.mapRef.current?.leafletElement.getZoom() as number;
      this.setState({
        center: center,
        zoom: zoom
      });
      this.loadUbs(center.lat, center.lng);
    }
  };

  private addMarkers() {
    const { ubsList } = this.state;
    const list = ubsList.map((ubs: IUbs) => (
      <Marker
        key={ubs.id}
        position={[ubs.geocode.latitude, ubs.geocode.longitude]}
        icon={ubsIcon}
      >
        <Popup>
          <br /> Nome: {ubs.name}
          <br /> Endereço: {ubs.address}
          <br /> Cidade: {ubs.city}
          <br /> Telefone: {ubs.phone}
          <br /> Latitude: {ubs.geocode.latitude}
          <br /> Longitude: {ubs.geocode.longitude}
        </Popup>
      </Marker>
    ));
    list.push(
      <Marker
        key={0}
        ref={this.centerRef}
        draggable={true}
        ondragend={this.updatePosition}
        position={[this.state.center.lat, this.state.center.lng]}
        icon={pointerIcon}
      >
        <Popup>
          Sua localização atual:
          <br /> Latitude: {this.state.center.lat}
          <br /> Longitude: {this.state.center.lng}
        </Popup>
      </Marker>
    );
    return list;
  }

  render() {
    return (
      <Map
        ref={this.mapRef}
        center={[this.state.center.lat, this.state.center.lng]}
        zoom={this.state.zoom}
      >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {this.addMarkers()}
      </Map>
    );
  }

  private load() {
    const geo = navigator.geolocation;
    if (geo) {
      geo.getCurrentPosition(
        (coords: any) => {
          const lat = coords.coords.latitude;
          const lng = coords.coords.longitude;
          this.setState({
            center: { lat: lat, lng: lng }
          });
          this.loadUbs(lat, lng);
        },
        (error: any) => {
          console.error(error.message);
        },
        {
          enableHighAccuracy: false,
          timeout: Infinity,
          maximumAge: 0
        }
      );
    }
  }

  private loadUbs(lat: number, lng: number, distance: number = 10) {
    const url = `${HOST}/api/v1/ubs?query=${lat},${lng},${distance}&page=0&size=1000`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.addUbsList(data);
      })
      .catch(console.log);
  }

  private addUbsList(data: any) {
    const _ubsList = data._embedded.ubsDtoes;
    _ubsList.forEach((_ubs: any) => {
      const ubs: IUbs = _ubs.content;
      this.addUbs(ubs);
    });
  }

  private addUbs(ubs: IUbs) {
    if (
      _.findIndex(this.state.ubsList, (_ubs: IUbs) => _ubs.id === ubs.id) < 0
    ) {
      this.setState({
        ubsList: [
          ...this.state.ubsList,
          {
            id: ubs.id,
            name: ubs.name,
            address: ubs.address,
            city: ubs.city,
            phone: ubs.phone,
            geocode: {
              latitude: ubs.geocode.latitude,
              longitude: ubs.geocode.longitude
            }
          }
        ]
      });
    }
  }
}
