/**
 * QDL.js - Qualcomm Download Protocol Library
 * Main entry point with convenience exports and utilities
 */

// Core exports
export { qdlDevice } from './qdl.js';
export { usbClass } from './usblib.js';
export { Firehose } from './firehose.js';
export { Sahara } from './sahara.js';
export { GPT } from './gpt.js';
export { xmlParser, toXml } from './xml.js';
export { createLogger, Logger, LogLevel, globalLogLevel } from './logger.js';

import * as Sparse from './sparse.js';
export { Sparse };

// Utilities
export {
  packGenerator,
  concatUint8Array,
  containsBytes,
  compareStringToBytes,
  runWithTimeout
} from './utils.js';

// Constants
export {
  USB_CONSTANTS,
  GPT_CONSTANTS,
  SPARSE_CONSTANTS,
  DEFAULT_CONFIGS,
  COMMON_PARTITIONS,
  LOG_LEVELS,
  // Also export individual constants for backwards compatibility
  VENDOR_ID,
  PRODUCT_ID,
  QDL_CLASS_CODE,
  BULK_TRANSFER_SIZE
} from './constants.js';

// Errors
export {
  QDLError,
  ConnectionError,
  USBError,
  ProtocolError,
  FlashError,
  GPTError,
  SparseError,
  TimeoutError,
  ValidationError
} from './errors.js';

// CLI utilities (for programmatic use)
export { createQdl, createProgress } from './cli.js';

// Version info
export const VERSION = "1.0.0";

// Type definitions (these are just for TypeScript - they don't exist at runtime)
export type ProgressCallback = (progress: number) => void;
export type SlotType = "a" | "b";
export type LogLevelType = "silent" | "error" | "warn" | "info" | "debug";

export interface Partition {
  type: string;
  uuid: string;
  start: bigint;
  end: bigint;
  sectors: bigint;
  attributes: string;
  name: string;
}

export interface StorageInfo {
  total_blocks: number;
  block_size: number;
  page_size: number;
  num_physical: number;
  manufacturer_id: number;
  serial_num: number;
  fw_version: string;
  mem_type: string;
  prod_name: string;
}

export interface DeviceManifest {
  name: string;
  programmer: string;
  partitions: Record<string, { required: boolean; description: string }>;
  config?: {
    sectorSize?: number;
    maxTransferSize?: number;
    verifyAfterFlash?: boolean;
  };
}

export interface DeviceInfo {
  activeSlot: SlotType;
  storage: StorageInfo;
  serial?: string;
  partitions?: string[];
  slots?: string[];
}

// Convenience functions
import { qdlDevice } from './qdl.js';
import { usbClass } from './usblib.js';

/**
 * Create a QDL device instance from a manifest
 */
export async function createDeviceFromManifest(manifest: DeviceManifest): Promise<qdlDevice> {
  const programmer = await fetch(manifest.programmer)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch programmer: ${response.statusText}`);
      }
      return response.arrayBuffer();
    });

  const device = new qdlDevice(programmer);
  
  // Apply any custom configuration
  if (manifest.config) {
    const firehose = device.firehose;
    if (manifest.config.sectorSize) {
      firehose.cfg.SECTOR_SIZE_IN_BYTES = manifest.config.sectorSize;
    }
    if (manifest.config.maxTransferSize) {
      firehose.cfg.MaxPayloadSizeToTargetInBytes = manifest.config.maxTransferSize;
    }
  }

  return device;
}

/**
 * Quick connect to a device with automatic USB setup
 */
export async function quickConnect(
  programmerUrl: string, 
  // options: Record<string, any> = {}
): Promise<qdlDevice> {
  const programmer = await fetch(programmerUrl).then(r => r.arrayBuffer());
  const device = new qdlDevice(programmer);
  const usb = new usbClass();
  
  await device.connect(usb);
  return device;
}

/**
 * Get basic device information quickly
 */
export async function getDeviceInfo(device: qdlDevice): Promise<DeviceInfo> {
  const [activeSlot, storage] = await Promise.all([
    device.getActiveSlot(),
    device.getStorageInfo()
  ]);

  const [slotsCount, partitions] = await device.getDevicePartitionsInfo();

  return {
    activeSlot,
    storage,
    serial: device.sahara?.serial,
    partitions,
    slots: slotsCount > 0 ? ['a', 'b'] : []
  };
}

/**
 * Validate a device manifest
 */
export function validateManifest(manifest: DeviceManifest): string[] {
  const errors: string[] = [];

  if (!manifest.name) {
    errors.push("Manifest must have a name");
  }

  if (!manifest.programmer) {
    errors.push("Manifest must specify a programmer URL");
  }

  if (!manifest.partitions || Object.keys(manifest.partitions).length === 0) {
    errors.push("Manifest must define at least one partition");
  }

  // Validate partition definitions
  for (const [name, partition] of Object.entries(manifest.partitions || {})) {
    if (typeof partition.required !== 'boolean') {
      errors.push(`Partition ${name}: 'required' must be a boolean`);
    }
    if (!partition.description) {
      errors.push(`Partition ${name}: 'description' is required`);
    }
  }

  return errors;
}

/**
 * Common device manifests for well-known devices
 */
export const DEVICE_MANIFESTS = {
  COMMA_3: {
    name: "comma 3/3X",
    programmer: "https://raw.githubusercontent.com/commaai/flash/master/src/QDL/programmer.bin",
    partitions: {
      "abl_a": { required: true, description: "Android Bootloader A" },
      "abl_b": { required: true, description: "Android Bootloader B" },
      "boot_a": { required: true, description: "Boot partition A" },
      "boot_b": { required: true, description: "Boot partition B" },
      "system_a": { required: true, description: "System partition A" },
      "system_b": { required: true, description: "System partition B" },
      "vendor_a": { required: true, description: "Vendor partition A" },
      "vendor_b": { required: true, description: "Vendor partition B" },
      "userdata": { required: false, description: "User data partition" },
      "persist": { required: false, description: "Persistent data partition" }
    }
  } as DeviceManifest,

  ONEPLUS_6T: {
    name: "OnePlus 6T",
    programmer: "https://raw.githubusercontent.com/bkerler/Loaders/master/oneplus/0008b0e10051459b_dd7c5f2e53176bee_fhprg_op6t.bin",
    partitions: {
      "boot_a": { required: true, description: "Boot partition A" },
      "boot_b": { required: true, description: "Boot partition B" },
      "system_a": { required: true, description: "System partition A" },
      "system_b": { required: true, description: "System partition B" },
      "vendor_a": { required: true, description: "Vendor partition A" },
      "vendor_b": { required: true, description: "Vendor partition B" },
      "userdata": { required: false, description: "User data partition" }
    }
  } as DeviceManifest
} as const;

/**
 * Check if WebUSB is supported in the current environment
 */
export function isWebUSBSupported(): boolean {
  return typeof navigator !== 'undefined' && 'usb' in navigator;
}

/**
 * Check if Node.js USB is available
 */
export function isNodeUSBSupported(): boolean {
  try {
    require('usb');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the appropriate USB class for the current environment
 */
export function getUSBClass(): typeof usbClass {
  if (typeof window !== 'undefined' && isWebUSBSupported()) {
    return usbClass; // Browser environment
  } else if (isNodeUSBSupported()) {
    return usbClass; // Node.js environment
  } else {
    throw new Error('No USB support available in this environment');
  }
}

/**
 * Utility to create a progress tracker
 */
export function createProgressTracker(onProgress?: (percent: number) => void) {
  let lastPercent = -1;
  
  return (current: number, total: number) => {
    const percent = Math.round((current / total) * 100);
    if (percent !== lastPercent) {
      lastPercent = percent;
      onProgress?.(percent);
    }
  };
}

/**
 * Utility to format bytes in human-readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Utility to format duration in human-readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

/**
 * Default export for easier importing
 */
export default {
  qdlDevice,
  usbClass,
  Sparse,
  createDeviceFromManifest,
  quickConnect,
  getDeviceInfo,
  validateManifest,
  DEVICE_MANIFESTS,
  isWebUSBSupported,
  isNodeUSBSupported,
  getUSBClass,
  createProgressTracker,
  formatBytes,
  formatDuration,
  VERSION
};