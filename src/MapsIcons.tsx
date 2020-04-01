import { Icon } from 'leaflet';

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