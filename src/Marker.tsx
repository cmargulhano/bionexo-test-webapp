import React from 'react';
import './Marker.css';

const Marker = (props: any) => {
  const { color, name, id } = props;
  return (
    <div>
      <div
        key={id}
        className="pin bounce"
        style={{ backgroundColor: color, cursor: 'pointer' }}
        title={name}
      ></div>
      <div>{name}</div>
    </div>
  );
};

export default Marker;
