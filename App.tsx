import React, {useEffect, useCallback, useState, useRef} from 'react';
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
import {useAppState} from './hooks';

/** BLE Modules */
import { BleEventType, BleState, PeripheralType } from './types';
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
/** */

function App() {
  const appState = useAppState();
  const [peripherals, setPeripherals] = useState<PeripheralType[]>([]);
  const peripheralsRef = useRef(peripherals);
  const [bleState, setBleState] = useState(BleState.on);
  console.log('app state: ', appState);
  console.log('ble state: ', bleState);

  useEffect(() => {
    console.log('BLE is ready to start...');
    BleManager.start({ showAlert: false })
    .then(() => {
      BleManager.scan([], 3, true).then(() => console.log('BLE starts scanning..'));
      BleManager.checkState() // trigger BleManagerDidUpdateState event
    })
    .catch(err => console.log('Ble initialize error: ', err));

    bleManagerEmitter.addListener(BleEventType.DiscoverPeripheral, (peripheral: PeripheralType) => {
      if (peripheral.id && !peripheralsRef.current.find(p => p.id === peripheral.id)) {
        console.log('Found new peripheral: ', peripheral.name);
        setPeripherals(prevPeripherals => prevPeripherals.concat(peripheral));
        peripheralsRef.current.push(peripheral);
      }
    })
    bleManagerEmitter.addListener(BleEventType.DidUpdateState, (args) => {
      console.log(BleEventType.DidUpdateState, args);
      setBleState(args.state);
    })
  }, []);

  /** */

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1, padding: 8, alignItems: 'center' }}>
        <ScrollView>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 32 }}>{`BLE devices (${peripherals.length})`}</Text>
            {bleState === BleState.on && <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'green' }}>ON</Text>}
            {bleState === BleState.off && <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'red' }}>OFF</Text>}
          </View>
          {peripherals.map((peripheral, idx) => (
            <View key={peripheral.id} style={{ marginBottom: 16 }}>
              <Text>{peripheral.id}</Text>
              <Text style={{ fontWeight: 'bold' }}>{peripheral.name}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default App;
