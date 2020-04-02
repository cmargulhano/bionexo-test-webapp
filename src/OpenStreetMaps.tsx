import { Backdrop, CircularProgress } from '@material-ui/core';
import _ from 'lodash';
import React, { Component, createRef, Fragment } from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import { IUbs } from './IUbs';
import { pointerIcon, ubsIcon } from './MapsIcons';
import UbsTable from './UbsTable';
import './OpenStreetMaps.css';

//const HOST = 'https://ubs-microservice.herokuapp.com';
const HOST = 'http://localhost:8080';

type State = {
  center: {
    lat?: number;
    lng?: number;
  };
  zoom: number;
  ubsList: IUbs[];
  showProgress: boolean;
};

/**
 * OpenStreet Maps Component
 * @author Cláudio Margulhano
 */
export default class OpenStreetMaps extends Component<{}, State> {
  state = {
    center: {
      lat: 0,
      lng: 0
    },
    zoom: 13,
    ubsList: [],
    showProgress: false
  };
  mapRef = createRef<Map>();
  centerRef = createRef<Marker>();
  ubsTable = createRef<UbsTable>();

  componentDidMount() {
    this.load();
  }

  render() {
    return (
      <Fragment>
        <Backdrop
          className="backdrop"
          open={this.state.showProgress}
          onClick={this.handleClose}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <UbsTable ref={this.ubsTable} onSelectUbs={this.setCenter} />
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
      </Fragment>
    );
  }

  handleClose = () => {
    this.setState({ showProgress: false });
  };

  setCenter = (id: string) => {
    const ubs = _.find(
      this.state.ubsList,
      (_ubs: IUbs) => _ubs.id === id
    ) as IUbs;
    this.setState({
      center: { lat: ubs?.geocode.latitude, lng: ubs?.geocode.longitude }
    });
    this.centerRef.current?.setState({
      lat: ubs?.geocode.latitude,
      lng: ubs?.geocode.longitude
    });
    this.loadUbs(ubs?.geocode.latitude, ubs?.geocode.longitude);
  };

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
    this.setState({ showProgress: true });
    const url = `${HOST}/api/v1/ubs?query=${lat},${lng},${distance}&page=0&size=9999`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.addUbsList(data);
        this.setState({ showProgress: false });
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
      setTimeout(() => {
        this.ubsTable.current?.setState({ data: this.state.ubsList });
      }, 100);
    }
  }
}
