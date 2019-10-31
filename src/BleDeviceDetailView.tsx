import React, {useState, useContext, useEffect, useCallback, useReducer} from 'react';
import { View, Text, SafeAreaView, Alert, ScrollView } from 'react-native';
import { Peripheral } from 'react-native-ble-manager';
import { Card, Button } from 'react-native-elements';
import BleContext from './context/BleContext';
import { BleEventType } from './types';

type BleDeviceDetailViewPropType = {
  navigation: any
}

function BleDeviceDetailView(props: BleDeviceDetailViewPropType) {
  const peripheral: Peripheral = props.navigation.getParam('peripheral');
  const { BleManager,bleManagerEmitter } = useContext(BleContext);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDeviceConnected, setDeviceConnected] = useState(false);
  const [connectedDeviceInfo, setConnectedDeviceInfo] = useReducer((state, newState) => {
    return {
      ...state,
      ...newState,
    };
  }, {});

  const { advertising } = peripheral;
  const handleConntectedBleDevice = useCallback(
    (peripheral) => {
      setIsConnecting(false);
      BleManager.retrieveServices(peripheral.peripheral)
      .then((info: any) => {
          Alert.alert(
            `${peripheral.peripheral} is connected, info: ${JSON.stringify(info)}`
          );
          setDeviceConnected(true);
          setConnectedDeviceInfo(info);
        });
    }, []
  )

  useEffect(() => {
    bleManagerEmitter.addListener(BleEventType.ConnectPeripheral, handleConntectedBleDevice);
    BleManager.isPeripheralConnected(peripheral.id).then(setDeviceConnected);
  }, [])

  return (
    <SafeAreaView>
      <ScrollView>

        <Card title={peripheral.name || 'Unknown'}>
          <Text style={{ color: 'gray' }}>{`Device Id: ${peripheral.id}`}</Text>
          <Text>{`rssi: ${peripheral.rssi}`}</Text>
          {advertising && (
            <>
              <Text>Local Name: {advertising.localName || '-'}</Text>
              <Text>txPowerLevel: {advertising.txPowerLevel || '-'}</Text>
              <Text>manufacturerData: {JSON.stringify(advertising.manufacturerData) || '-'}</Text>
              {advertising.serviceUUIDs && (
                <>
                  <Text>ServiceUUIDs: </Text>
                  {advertising.serviceUUIDs.map(serviceUUID => {
                    return <Text key={serviceUUID}>{serviceUUID}</Text>;
                  })}
                </>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 16 }}>
                  {!isDeviceConnected && (
                    <Button
                      title="Connect"
                      onPress={async () => {
                        try {
                          setIsConnecting(true);
                          await BleManager.connect(peripheral.id);

                        } catch (err) {
                          Alert.alert(`connect failed, reason: ${JSON.stringify(err)}`);
                        }
                      }}
                      disabled={!advertising.isConnectable}
                      loading={isConnecting}
                    />
                  )}
                  {(isDeviceConnected) && (
                    <Button
                      title="Disconnect"
                      onPress={async () => {
                        await BleManager.disconnect(peripheral.id)
                        setIsConnecting(false);
                        setDeviceConnected(false);
                      }}
                      buttonStyle={{ backgroundColor: 'red' }}
                    />
                  )}
              </View>
            </>
            )}
        </Card>
        {connectedDeviceInfo.characteristics && (
          connectedDeviceInfo.characteristics.map((character, idx) => (
            <Card title={character.service} key={idx}>
              <Text>Characteristics: {character.characteristic}</Text>
              <Text>{`isNotifying: ${character.isNotifying}`}</Text>
              <Text>{`properties: ${character.properties}`}</Text>
              {(character.properties.includes('Write') || character.properties.includes('WriteWithoutResponse')) && (
                <Button
                  title="Communicate"
                />
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default BleDeviceDetailView;
