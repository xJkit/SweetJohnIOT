import React, {useEffect, useCallback, useState, useReducer, useContext} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Button, ListItem } from 'react-native-elements';
import { Peripheral } from 'react-native-ble-manager';
/** Ble Context */
import BleContext, { BleProvider } from './context/BleContext';
/** routing */
import { createAppContainer, NavigationScreenProps } from 'react-navigation';
import { createStackNavigator  } from 'react-navigation-stack';

import BleDeviceDetailView from './BleDeviceDetailView';
import Icons from './components/Icons';
import {useAppState} from './hooks';
import { BleEventType, BleState, ActionTypes, FindPeripheralDeviceActions } from './types';

const findPeripheralsReducer = (state: Peripheral[], action: FindPeripheralDeviceActions) => {
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

function App(props: NavigationScreenProps) {
  const { BleManager, bleManagerEmitter } = useContext(BleContext);
  const { navigation } = props;
  const appState = useAppState();
  const [bleState, setBleState] = useState(BleState.on);
  const [isScanning, setIsScanning] = useState(false);
  const [foundPeripherals, dispatch] = useReducer(findPeripheralsReducer, []);

  const handleBleStartScan = () => {
    if (bleState !== 'on') {
      Alert.alert(
        'Please turn on Bluetooth',
        undefined,
        [{ text: 'OK' }]
      );
      return;
    }
    BleManager.scan([], 3, true)
      .then(() => setIsScanning(true));
  };
  const handleBleDiscoverPeripherals = useCallback((peripheral: Peripheral) => {
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
      BleManager.checkState() // trigger BleManagerDidUpdateState event
    })
    .catch((err: any) => console.log('=== Ble initialize error: ', err));

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
            {foundPeripherals.map((peripheral) => {
              return (
                <ListItem
                  key={peripheral.id}
                  title={peripheral.name || 'Unknown'}
                  titleStyle={{ fontWeight: 'bold' }}
                  subtitle={peripheral.id}
                  subtitleStyle={{ color: 'grey', fontSize: 14 }}
                  onPress={() => navigation.navigate('BleDeviceDetailView', { peripheral })}
                />
              );
              })}
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


/** Routing configs */

const AppNavigator = createStackNavigator(
  {
    Home: {
      screen: App,
      navigationOptions: {
        header: null,
      },
    },
    BleDeviceDetailView: {
      screen: BleDeviceDetailView,
      navigationOptions: {
        title: 'Device Detail',
      },
    },
  },
  {
    initialRouteName: 'Home',
  },
);

const AppContainer = createAppContainer(AppNavigator);

export default function AppRoot() {
  return (
    <BleProvider>
      <AppContainer />
    </BleProvider>
  );
}
