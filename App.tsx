import React, {useEffect, useCallback, useState, useReducer} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  NativeModules,
  NativeEventEmitter,
  View,
  Text,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Button, ListItem } from 'react-native-elements';

import Icons from './src/components/Icons';
import {useAppState} from './hooks';

/** BLE Modules */
import { BleEventType, BleState, PeripheralType, ActionTypes, FindPeripheralDeviceActions } from './types';
import BleManager, { Peripheral } from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
/** */

const findPeripheralsReducer = (state: PeripheralType[], action: FindPeripheralDeviceActions) => {
  switch (action.type) {
    case ActionTypes.FIND_PERIPHERAL_DEVICE: {
      const isDeviceAlreadyFound = state.find(peripheral => peripheral.id === action.payload.id);
      if (isDeviceAlreadyFound) return state;
      return state.concat(action.payload);
    };
    case ActionTypes.CLEAR_PERIPHERAL_DEVICE:
      return [];
    default:
      throw new Error('Invalid action type');
  }
}

function App() {
  const appState = useAppState();
  const [bleState, setBleState] = useState(BleState.on);
  const [isScanning, setIsScanning] = useState(false);
  const [foundPeripherals, dispatch] = useReducer(findPeripheralsReducer, []);

  const handleBleStartScan = () => {
    BleManager.scan([], 3, true)
      .then(() => setIsScanning(true));
  };
  const handleBleDiscoverPeripherals = useCallback((peripheral: PeripheralType) => {
    if (peripheral.id) {
      console.log('======= Found new peripheral: ', peripheral.name);
      dispatch({
        type: ActionTypes.FIND_PERIPHERAL_DEVICE,
        payload: peripheral,
      });
    }
  }, []);
  const handleBleUpdateState = useCallback((args) => {
    console.log(BleEventType.DidUpdateState, args);
    setBleState(args.state);
  }, []);

  const handleStopScan = useCallback(() => {
    setIsScanning(false);
  }, []);
  console.log('--- app state: ', appState);
  console.log('--- ble state: ', bleState);

  useEffect(() => {
    BleManager.start({ showAlert: false })
    .then(() => {
      console.log('=== BLE Start Success!===');
      handleBleStartScan();
      BleManager.checkState() // trigger BleManagerDidUpdateState event
    })
    .catch(err => console.log('=== Ble initialize error: ', err));

    bleManagerEmitter.addListener(BleEventType.DiscoverPeripheral, handleBleDiscoverPeripherals);
    bleManagerEmitter.addListener(BleEventType.DidUpdateState, handleBleUpdateState);
    bleManagerEmitter.addListener(BleEventType.StopScan, handleStopScan);
  }, []);

  /** */

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1, padding: 8, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 32 }}>{`BLE devices (${foundPeripherals.length})`}</Text>
          {bleState === BleState.on && <Icons.FontAwesome name="power-off" size={32} color="green" style={{ marginLeft: 8 }} />}
          {bleState === BleState.off && <Icons.FontAwesome name="power-off" size={32} color="red" style={{ marginLeft: 8 }} />}
        </View>
        <View style={{ flex: 1, width: '100%' }}>
          <ScrollView>
            {foundPeripherals.map((peripheral) => (
              <ListItem
                key={peripheral.id}
                title={peripheral.name || 'Unknown'}
                titleStyle={{ fontWeight: 'bold' }}
                subtitle={peripheral.id}
                subtitleStyle={{ color: 'grey', fontSize: 14 }}
              />
            ))}
          </ScrollView>
        </View>
        <View style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 8 }}>
          <Button
            disabled={isScanning}
            title={isScanning ? 'Scanning' : 'Scan'}
            icon={
              <>
                {isScanning && <ActivityIndicator style={{ marginRight: 8 }} />}
                {!isScanning && (
                  <Icons.MaterialCommunityIcons
                    name="shield-search"
                    color="white"
                    size={22}
                    style={{ marginRight: 8 }}
                  />
                )}
              </>
            }
            onPress={handleBleStartScan}
          />
          <Button
            title="Clear"
            onPress={() => dispatch({ type: ActionTypes.CLEAR_PERIPHERAL_DEVICE })}
            style={{ marginLeft: 8 }}
            buttonStyle={{ backgroundColor: 'red' }}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default App;
