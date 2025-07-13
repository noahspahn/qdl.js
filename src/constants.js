export const VENDOR_ID = 0x05C6;
export const PRODUCT_ID = 0x9008;
export const QDL_CLASS_CODE = 0xFF;
export const BULK_TRANSFER_SIZE = 16384;

export const USB_CONSTANTS = {
    VENDOR_ID,
    PRODUCT_ID,
    QDL_CLASS_CODE,
    BULK_TRANSFER_SIZE,
};

export const GPT_CONSTANTS = {
    SIGNATURE: "EFI PART",
    REVISION: 0x10000,
    TYPE_EFI_UNUSED: "00000000-0000-0000-0000-000000000000",
    ATTRIBUTE_FLAG_OFFSET: 48n,
    AB_FLAG_OFFSET: 54n, // ATTRIBUTE_FLAG_OFFSET + 6n
};

export const SPARSE_CONSTANTS = {
    FILE_MAGIC: 0xed26ff3a,
    FILE_HEADER_SIZE: 28,
    CHUNK_HEADER_SIZE: 12,
    CHUNK_TYPE_RAW: 0xCAC1,
    CHUNK_TYPE_FILL: 0xCAC2,
    CHUNK_TYPE_SKIP: 0xCAC3,
    CHUNK_TYPE_CRC32: 0xCAC4,
};

export const DEFAULT_CONFIGS = {
    SECTOR_SIZE: 4096,
    MAX_TRANSFER_SIZE: 1048576,
    CONNECTION_TIMEOUT: 30000,
    COMMAND_TIMEOUT: 5000,
    MAX_RETRIES: 3,
};

export const COMMON_PARTITIONS = {
    BOOTLOADER: ['abl_a', 'abl_b', 'xbl_a', 'xbl_b'],
    BOOT: ['boot_a', 'boot_b'],
    SYSTEM: ['system_a', 'system_b', 'super'],
    VENDOR: ['vendor_a', 'vendor_b'],
    USERDATA: ['userdata'],
    RECOVERY: ['recovery_a', 'recovery_b'],
    CRITICAL: ['persist', 'misc', 'metadata'],
};

export const LOG_LEVELS = {
    SILENT: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
};