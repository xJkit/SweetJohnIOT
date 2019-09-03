import React from 'react';
import { NativeModules, NativeEventEmitter, EventEmitter } from 'react-native';

/** BLE Modules */
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
/** */

type BleContextType = {
  BleManager: any;
  bleManagerEmitter: NativeEventEmitter;
}

const BleContext = React.createContext<BleContextType>({
  BleManager,
  bleManagerEmitter,
});

export default BleContext;
export class BleProvider extends React.Component {
  state = {
    BleManager,
    bleManagerEmitter,
  };

  render() {
    return (
      <BleContext.Provider value={this.state}>
        {this.props.children}
      </BleContext.Provider>
    );
  }
}
