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

export enum ActionTypes {
  FIND_PERIPHERAL_DEVICE,
  CLEAR_PERIPHERAL_DEVICE,
};

export type FindPeripheralDeviceActions =
  | { type: ActionTypes.FIND_PERIPHERAL_DEVICE, payload: PeripheralType }
  | { type: ActionTypes.CLEAR_PERIPHERAL_DEVICE };


