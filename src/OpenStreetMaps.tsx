import _ from 'lodash';
import React, { Component, createRef } from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import { IUbs } from './IUbs';
import { ubsIcon, pointerIcon } from './MapsIcons';

//const HOST = 'https://ubs-microservice.herokuapp.com';
const HOST = 'http://localhost:8080';

type State = {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  ubsList: IUbs[];
};

/**
 * OPenmComponent
 * @author Cláudio Margulhano
 */
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

  /**
   * Updates current position
   */
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

  /**
   * Add markers:
   *   - current location
   *   - All UBS locations
   */
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

  /**
   * Load UBS from current location
   */
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

  /**
   * Fetch UBS list
   * @param lat latitude
   * @param lng longitude
   * @param distance distance in kilometers, default is 10Km
   */
  private loadUbs(lat: number, lng: number, distance: number = 10) {
    const url = `${HOST}/api/v1/ubs?query=${lat},${lng},${distance}&page=0&size=9999`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.addUbsList(data);
      })
      .catch(console.log);
  }

  /**
   * Append UBS list from current location
   *
   * @param data json response
   */
  private addUbsList(data: any) {
    const _ubsList = data._embedded.ubsDtoes;
    _ubsList.forEach((_ubs: any) => {
      const ubs: IUbs = _ubs.content;
      this.addUbs(ubs);
    });
  }

  /**
   * Adds UBS in list, if not exists
   * 
   * @param ubs UBS
   */
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
