/**
 * Type definitions for QDL.js library
 */

/** Progress callback function for tracking operation progress */
export type ProgressCallback = (progress: number) => void;

/** Device slot identifier */
export type SlotType = "a" | "b";

/** Log level for controlling output verbosity */
export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

/** Partition information from GPT */
export interface Partition {
  /** Partition type GUID */
  type: string;
  /** Unique partition GUID */
  uuid: string;
  /** Starting LBA */
  start: bigint;
  /** Ending LBA */
  end: bigint;
  /** Number of sectors */
  sectors: bigint;
  /** Partition attributes as hex string */
  attributes: string;
  /** Partition name */
  name: string;
}

/** Storage device information */
export interface StorageInfo {
  /** Total blocks */
  total_blocks: number;
  /** Block size in bytes */
  block_size: number;
  /** Page size in bytes */
  page_size: number;
  /** Number of physical partitions */
  num_physical: number;
  /** Manufacturer ID */
  manufacturer_id: number;
  /** Device serial number */
  serial_num: number;
  /** Firmware version */
  fw_version: string;
  /** Memory type (e.g., "UFS") */
  mem_type: string;
  /** Product name */
  prod_name: string;
}

/** Partition manifest entry */
export interface PartitionManifest {
  /** Whether this partition is required for basic operation */
  required: boolean;
  /** Human-readable description */
  description: string;
  /** Expected size in bytes (optional) */
  size?: number;
  /** Slot-specific partition (optional) */
  slotted?: boolean;
}

/** Device manifest for automated flashing */
export interface DeviceManifest {
  /** Device name/identifier */
  name: string;
  /** URL or path to programmer/loader */
  programmer: string;
  /** Partition definitions */
  partitions: Record<string, PartitionManifest>;
  /** Device-specific configuration (optional) */
  config?: {
    /** Sector size in bytes */
    sectorSize?: number;
    /** Maximum transfer size */
    maxTransferSize?: number;
    /** Whether to verify after flash */
    verifyAfterFlash?: boolean;
  };
}

/** Flash operation configuration */
export interface FlashConfig {
  /** Whether to erase before flashing sparse images */
  eraseBeforeFlashSparse?: boolean;
  /** Whether to verify flash operation */
  verify?: boolean;
  /** Progress callback */
  onProgress?: ProgressCallback;
  /** Custom sector size override */
  sectorSize?: number;
}

/** USB device filter for WebUSB */
export interface USBDeviceFilter {
  vendorId: number;
  productId: number;
  classCode?: number;
}

/** GPT header information */
export interface GPTHeader {
  signature: string;
  revision: number;
  headerSize: number;
  headerCrc32: number;
  currentLba: bigint;
  alternateLba: bigint;
  firstUsableLba: bigint;
  lastUsableLba: bigint;
  partEntriesStartLba: bigint;
  numPartEntries: number;
  partEntrySize: number;
  partEntriesCrc32: number;
}

/** Sparse image header */
export interface SparseHeader {
  magic: number;
  majorVersion: number;
  minorVersion: number;
  fileHeaderSize: number;
  chunkHeaderSize: number;
  blockSize: number;
  totalBlocks: number;
  totalChunks: number;
  crc32: number;
}

/** Sparse image chunk */
export interface SparseChunk {
  type: number;
  blocks: number;
  data: Blob;
}

/** QDL device connection options */
export interface ConnectionOptions {
  /** USB device filters */
  usbFilters?: USBDeviceFilter[];
  /** Connection timeout in milliseconds */
  timeout?: number;
  /** Whether to automatically configure after connection */
  autoConfig?: boolean;
}

/** Device information */
export interface DeviceInfo {
  /** Active boot slot */
  activeSlot: SlotType;
  /** Storage information */
  storage: StorageInfo;
  /** Device serial number */
  serial?: string;
  /** Available partitions */
  partitions?: string[];
  /** Available slots */
  slots?: string[];
}

/** Flash operation result */
export interface FlashResult {
  /** Whether operation succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Bytes transferred */
  bytesTransferred?: number;
  /** Operation duration in milliseconds */
  duration?: number;
}

/** Erase operation options */
export interface EraseOptions {
  /** Whether to preserve GPT structures */
  preserveGpt?: boolean;
  /** Partitions to preserve during full erase */
  preservePartitions?: string[];
}

/** QDL protocol response */
export interface QDLResponse {
  /** Whether operation succeeded */
  resp: boolean;
  /** Response data */
  data: Uint8Array;
  /** Error message if any */
  error?: string;
  /** Log messages */
  log?: string[];
}

/** Sahara protocol modes */
export enum SaharaMode {
  IMAGE_TX_PENDING = 0x0,
  COMMAND = 0x3,
}

/** Sahara command types */
export enum SaharaCommand {
  HELLO_REQ = 0x1,
  HELLO_RSP = 0x2,
  READ_DATA = 0x3,
  END_TRANSFER = 0x4,
  DONE_REQ = 0x5,
  DONE_RSP = 0x6,
  RESET_RSP = 0x8,
  CMD_READY = 0xB,
  SWITCH_MODE = 0xC,
  EXECUTE_REQ = 0xD,
  EXECUTE_RSP = 0xE,
  EXECUTE_DATA = 0xF,
  MEMORY_READ_64 = 0x12,
}

/** Firehose configuration */
export interface FirehoseConfig {
  ZLPAwareHost: number;
  SkipStorageInit: number;
  SkipWrite: number;
  MaxPayloadSizeToTargetInBytes: number;
  MaxPayloadSizeFromTargetInBytes: number;
  MaxXMLSizeInBytes: number;
  bit64: boolean;
  SECTOR_SIZE_IN_BYTES: number;
  MemoryName: string;
  maxlun: number;
  FastErase: boolean;
}

/** A/B partition flags */
export interface ABFlags {
  active: boolean;
  successful: boolean;
  unbootable: boolean;
  triesRemaining: number;
}

/** Library logger interface */
export interface Logger {
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  deviceMessage(message: string): void;
  flushDeviceMessages(): void;
}

/** Event emitter interface for device events */
export interface DeviceEvents {
  on(event: 'connected', listener: () => void): void;
  on(event: 'disconnected', listener: () => void): void;
  on(event: 'progress', listener: (progress: number) => void): void;
  on(event: 'error', listener: (error: Error) => void): void;
  on(event: 'log', listener: (level: LogLevel, message: string) => void): void;
  emit(event: string, ...args: any[]): boolean;
}

/** Extended QDL device interface with event support */
export interface QDLDeviceExtended extends DeviceEvents {
  readonly connected: boolean;
  readonly deviceInfo: DeviceInfo | null;
  connect(options?: ConnectionOptions): Promise<void>;
  disconnect(): Promise<void>;
  flashPartition(name: string, image: Blob | File, config?: FlashConfig): Promise<FlashResult>;
  erasePartition(name: string, options?: EraseOptions): Promise<boolean>;
  getPartitionList(): Promise<string[]>;
  getDeviceInfo(): Promise<DeviceInfo>;
}

// src/constants.ts
/**
 * Constants used throughout the QDL library
 */

/** USB vendor and product IDs */
export const USB_CONSTANTS = {
  VENDOR_ID: 0x05C6,
  PRODUCT_ID: 0x9008,
  QDL_CLASS_CODE: 0xFF,
  BULK_TRANSFER_SIZE: 16384,
} as const;

/** GPT constants */
export const GPT_CONSTANTS = {
  SIGNATURE: "EFI PART",
  REVISION: 0x10000,
  TYPE_EFI_UNUSED: "00000000-0000-0000-0000-000000000000",
  ATTRIBUTE_FLAG_OFFSET: 48n,
  AB_FLAG_OFFSET: 54n, // ATTRIBUTE_FLAG_OFFSET + 6n
} as const;

/** Sparse image constants */
export const SPARSE_CONSTANTS = {
  FILE_MAGIC: 0xed26ff3a,
  FILE_HEADER_SIZE: 28,
  CHUNK_HEADER_SIZE: 12,
  CHUNK_TYPE_RAW: 0xCAC1,
  CHUNK_TYPE_FILL: 0xCAC2,
  CHUNK_TYPE_SKIP: 0xCAC3,
  CHUNK_TYPE_CRC32: 0xCAC4,
} as const;

/** Default device configurations */
export const DEFAULT_CONFIGS = {
  SECTOR_SIZE: 4096,
  MAX_TRANSFER_SIZE: 1048576,
  CONNECTION_TIMEOUT: 30000,
  COMMAND_TIMEOUT: 5000,
  MAX_RETRIES: 3,
} as const;

/** Well-known partition names */
export const COMMON_PARTITIONS = {
  BOOTLOADER: ['abl_a', 'abl_b', 'xbl_a', 'xbl_b'],
  BOOT: ['boot_a', 'boot_b'],
  SYSTEM: ['system_a', 'system_b', 'super'],
  VENDOR: ['vendor_a', 'vendor_b'],
  USERDATA: ['userdata'],
  RECOVERY: ['recovery_a', 'recovery_b'],
  CRITICAL: ['persist', 'misc', 'metadata'],
} as const;

/** Log level values */
export const LOG_LEVELS = {
  SILENT: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
} as const;

// src/errors.ts
/**
 * Custom error classes for QDL operations
 */

/** Base error class for all QDL errors */
export class QDLError extends Error {
  constructor(message: string, public readonly code?: string, public readonly cause?: Error) {
    super(message);
    this.name = 'QDLError';
  }
}

/** Error thrown when device connection fails */
export class ConnectionError extends QDLError {
  constructor(message: string, cause?: Error) {
    super(message, 'CONNECTION_ERROR', cause);
    this.name = 'ConnectionError';
  }
}

/** Error thrown when USB operations fail */
export class USBError extends QDLError {
  constructor(message: string, cause?: Error) {
    super(message, 'USB_ERROR', cause);
    this.name = 'USBError';
  }
}

/** Error thrown when protocol operations fail */
export class ProtocolError extends QDLError {
  constructor(message: string, public readonly protocol: string, cause?: Error) {
    super(message, 'PROTOCOL_ERROR', cause);
    this.name = 'ProtocolError';
  }
}

/** Error thrown when flash operations fail */
export class FlashError extends QDLError {
  constructor(message: string, public readonly partition?: string, cause?: Error) {
    super(message, 'FLASH_ERROR', cause);
    this.name = 'FlashError';
  }
}

/** Error thrown when GPT operations fail */
export class GPTError extends QDLError {
  constructor(message: string, public readonly lun?: number, cause?: Error) {
    super(message, 'GPT_ERROR', cause);
    this.name = 'GPTError';
  }
}

/** Error thrown when sparse image operations fail */
export class SparseError extends QDLError {
  constructor(message: string, cause?: Error) {
    super(message, 'SPARSE_ERROR', cause);
    this.name = 'SparseError';
  }
}

/** Error thrown when timeout occurs */
export class TimeoutError extends QDLError {
  constructor(message: string, public readonly timeoutMs: number, cause?: Error) {
    super(message, 'TIMEOUT_ERROR', cause);
    this.name = 'TimeoutError';
  }
}

/** Error thrown when validation fails */
export class ValidationError extends QDLError {
  constructor(message: string, public readonly field?: string, cause?: Error) {
    super(message, 'VALIDATION_ERROR', cause);
    this.name = 'ValidationError';
  }
}

export {
  QDLError as default
};