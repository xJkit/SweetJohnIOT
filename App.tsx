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
} from 'react-native';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppState} from './hooks';

/** BLE Modules */
import { BleEventType, BleState, PeripheralType, ActionTypes, FindPeripheralDeviceAction } from './types';
import BleManager, { Peripheral } from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
/** */

const findPeripheralsReducer = (state: PeripheralType[], action: FindPeripheralDeviceAction) => {
  switch (action.type) {
    case ActionTypes.FIND_PERIPHERAL_DEVICE: {
      const isDeviceAlreadyFound = state.find(peripheral => peripheral.id === action.payload.id);
      if (isDeviceAlreadyFound) return state;
      return state.concat(action.payload);
    }
    default:
      throw new Error('Invalid action type');
  }
}

function App() {
  const appState = useAppState();
  const [bleState, setBleState] = useState(BleState.on);
  const [foundPeripherals, dispatch] = useReducer(findPeripheralsReducer, []);

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
  console.log('--- app state: ', appState);
  console.log('--- ble state: ', bleState);

  useEffect(() => {
    BleManager.start({ showAlert: false })
    .then(() => {
      console.log('=== BLE Start Success!===');
      BleManager.scan([], 3, true).then(() => console.log('=== BLE starts scanning ==='));
      BleManager.checkState() // trigger BleManagerDidUpdateState event
    })
    .catch(err => console.log('=== Ble initialize error: ', err));

    bleManagerEmitter.addListener(BleEventType.DiscoverPeripheral, handleBleDiscoverPeripherals);
    bleManagerEmitter.addListener(BleEventType.DidUpdateState, handleBleUpdateState);
  }, []);

  /** */

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1, padding: 8, alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <ScrollView>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 32 }}>{`BLE devices (${foundPeripherals.length})`}</Text>
              {bleState === BleState.on && <Icon name="power-off" size={32} color="green" style={{ marginLeft: 8 }} />}
              {bleState === BleState.off && <Icon name="power-off" size={32} color="red" style={{ marginLeft: 8 }} />}
            </View>
            {foundPeripherals.map((peripheral) => (
              <View key={peripheral.id} style={{ marginBottom: 16 }}>
                <Text>{peripheral.id}</Text>
                <Text style={{ fontWeight: 'bold' }}>{peripheral.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Button
            title="Scan"
            style={{ marginBottom: 8 }}
            icon={<IconMaterial name="shield-search" color="white" style={{ marginRight: 8 }} size={22} />}
            onPress={() => BleManager.scan([], 3, true).then(() => console.log('=== BLE starts scanning ==='))}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default App;
