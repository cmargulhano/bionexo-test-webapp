import GpsFixedIcon from '@material-ui/icons/GpsFixed';
import MaterialTable from 'material-table';
import React, { Component } from 'react';
import { IUbs } from './IUbs';
import './UbsTable.css';

type State = {
  columns?: any;
  data?: IUbs[] | any;
  onSelectUbs: (id: string) => void;
};

export default class UbsTable extends Component<State> {
  state = {
    columns: [
      { title: 'Id', field: 'id' },
      { title: 'Nome', field: 'name' }
    ],
    data: []
  };

  render() {
    return (
      <MaterialTable
        title="UBS"
        columns={this.state.columns}
        data={this.state.data}
        options={{ pageSize: 5, pageSizeOptions: [5] }}
        actions={[
          {
            icon: () => <GpsFixedIcon />,
            tooltip: 'Localizar UBS',
            onClick: (event, rowData) => this.props.onSelectUbs(rowData['id'])
          }
        ]}
      />
    );
  }
}
