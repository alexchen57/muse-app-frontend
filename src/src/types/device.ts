/**
 * Device Related Type Definitions
 * Corresponds to PRD Section 2.1: Prototype Hardware Interface
 */

import { Timestamp } from './common';

/**
 * Device Type
 */
export enum DeviceType {
  HEART_RATE_SENSOR = 'heart_rate_sensor',  // Heart Rate Sensor
  MWL_MONITOR = 'mwl_monitor'               // MWL Monitor (Simulator)
}

/**
 * Device Connection Status (Enum)
 */
export enum DeviceConnectionState {
  DISCONNECTED = 'disconnected',  // Disconnected
  CONNECTING = 'connecting',      // Connecting
  CONNECTED = 'connected',        // Connected
  ERROR = 'error'                 // Error State
}

/**
 * Device Connection Status (for store usage)
 * Simple interface for tracking device connection state
 */
export interface DeviceStatus {
  /** Whether the device is connected */
  isConnected: boolean;
  
  /** Last update timestamp */
  lastUpdate: number;
  
  /** Optional signal strength (0-100) */
  signalStrength?: number;
  
  /** Optional battery level (0-100) */
  batteryLevel?: number;
  
  /** Optional error message */
  errorMessage?: string;
}

/**
 * Device Information
 */
export interface DeviceInfo {
  /** Device ID */
  id: string;
  
  /** Device type */
  type: DeviceType;
  
  /** Device name */
  name: string;
  
  /** Connection status */
  status: DeviceConnectionState;
  
  /** Signal strength (0-100, optional) */
  signalStrength?: number;
  
  /** Battery level (0-100, optional) */
  batteryLevel?: number;
  
  /** Firmware version */
  firmwareVersion?: string;
  
  /** Last update time */
  lastUpdate: Timestamp;
}

/**
 * Serial Port Configuration (Arduino Heart Rate Sensor)
 * Corresponds to PRD Section 3.3: Web Serial API
 */
export interface SerialPortConfig {
  /** Baud rate */
  baudRate: number;
  
  /** Data bits */
  dataBits: 7 | 8;
  
  /** Stop bits */
  stopBits: 1 | 2;
  
  /** Parity */
  parity: 'none' | 'even' | 'odd';
  
  /** Flow control */
  flowControl: 'none' | 'hardware';
}

/**
 * Serial Device
 */
export interface SerialDevice {
  /** Port object */
  port: SerialPort;
  
  /** Device information */
  info: DeviceInfo;
  
  /** Configuration */
  config: SerialPortConfig;
  
  /** Whether port is open */
  isOpen: boolean;
}

/**
 * Device Connection Event
 */
export interface DeviceConnectionEvent {
  /** Device information */
  device: DeviceInfo;
  
  /** Event type */
  eventType: 'connected' | 'disconnected' | 'error';
  
  /** Timestamp */
  timestamp: Timestamp;
  
  /** Error message (if any) */
  error?: string;
}

/**
 * MWL Simulator Configuration
 * Corresponds to PRD Section 3.2: Simulated MWL Data Reception
 */
export interface MWLSimulatorConfig {
  /** Data generation frequency (Hz) */
  frequency: number;
  
  /** Add noise */
  addNoise: boolean;
  
  /** Noise level (0-1) */
  noiseLevel: number;
  
  /** Initial state */
  initialState: 'stressed' | 'calm' | 'productive' | 'distracted';
  
  /** Auto state transition */
  autoTransition: boolean;
}

/**
 * Device Error Type
 */
export enum DeviceErrorType {
  CONNECTION_FAILED = 'connection_failed',
  CONNECTION_LOST = 'connection_lost',
  INVALID_DATA = 'invalid_data',
  TIMEOUT = 'timeout',
  PERMISSION_DENIED = 'permission_denied',
  UNKNOWN = 'unknown'
}

/**
 * Device Error
 */
export interface DeviceError {
  /** Error type */
  type: DeviceErrorType;
  
  /** Error message */
  message: string;
  
  /** Device information */
  device: DeviceInfo;
  
  /** Timestamp */
  timestamp: Timestamp;
  
  /** Recoverable */
  recoverable: boolean;
}

/**
 * Re-export biometric types for backward compatibility
 * (Some components import these from device.ts)
 */
export { HeartRateData, MWLData } from './biometric';
