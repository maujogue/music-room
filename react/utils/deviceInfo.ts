import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

export interface DeviceInfo {
  platform: string;
  deviceModel: string;
  osVersion: string;
  appVersion: string;
}

export function getDeviceInfo(): DeviceInfo {
  const platform = Platform.OS; // 'ios', 'android', 'web'

  // Get OS version
  const osVersion = Platform.Version?.toString() || 'unknown';

  // Get device model from expo-device
  let deviceModel = 'unknown';
  if (Platform.OS === 'web') {
    deviceModel = 'Web';
  } else if (Device.modelName) {
    deviceModel = Device.modelName;
  } else if (Device.deviceName) {
    deviceModel = Device.deviceName;
  } else {
    deviceModel = `${Platform.OS} Device`;
  }

  // Get app version from app.json via Constants
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return {
    platform,
    deviceModel,
    osVersion,
    appVersion,
  };
}
