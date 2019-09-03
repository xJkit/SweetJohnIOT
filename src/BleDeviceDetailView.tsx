import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { Peripheral } from 'react-native-ble-manager';
import { Card, Button } from 'react-native-elements';

type BleDeviceDetailViewPropType = {
  navigation: any
}

function BleDeviceDetailView(props: BleDeviceDetailViewPropType) {
  const peripheral: Peripheral = props.navigation.getParam('peripheral');
  const { advertising } = peripheral;

  return (
    <SafeAreaView>
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
                <Button
                  title="Connect"
                  disabled={!advertising.isConnectable}
                />
            </View>
          </>
          )}
      </Card>
    </SafeAreaView>
  );
}

export default BleDeviceDetailView;
