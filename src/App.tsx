import React, { Fragment } from 'react';
import './App.css';
//import GoogleMaps from './GoogleMaps';
import OpenStreetMaps from './OpenStreetMaps';

const App = () => {
  return (
    <Fragment>
      {/* <GoogleMaps /> */}
      <OpenStreetMaps />
    </Fragment>
  );
};

export default App;
