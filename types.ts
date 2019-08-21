export enum BleEventType {
  DiscoverPeripheral = 'BleManagerDiscoverPeripheral',
  StopScan = 'BleManagerStopScan',
  DisconnectPeripheral = 'BleManagerDisconnectPeripheral',
  DidUpdateValueForCharacteristic = 'BleManagerDidUpdateValueForCharacteristic',
  DidUpdateState = 'BleManagerDidUpdateState',
};

export enum BleState {
  on = 'on',
  off = 'off',
};

export interface PeripheralType {
  name: string;
  id: string;
};
