import React from 'react';
import './index.css';
import GMap from '../Map/index';
import Dropdown from '../Dropdown';
import obj from '../Dropdown/content';

class Garage extends React.Component {
  state = {
    brand: null,
    maintenanceType: null,
  };

  maintenanceModifier = (event) => {
    const { value } = event.target;

    this.setState({ maintenanceType: value });
  };

  brandModifier = (event) => {
    const { value } = event.target;
    this.setState({ brand: value });
  };

  render() {
    return (
      <div className="pagestyle_garage flexContainerMap">
        <div className="lessMargin">
          <Dropdown content={obj.Brand} currentValue={this.brandModifier} />
        </div>
        <div className="lesserMargin">
          <Dropdown content={obj.TypeofMaintenance} currentValue={this.maintenanceModifier} />
        </div>
        <div className="flexItemMap">
          <GMap getDropDownValue={{ ...this.state }} />
        </div>
      </div>
    );
  }
}

export default Garage;
