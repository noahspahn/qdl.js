/** Base error class for all QDL errors */
export class QDLError extends Error {
  constructor(message, code, cause) {
    super(message);
    this.name = 'QDLError';
    this.code = code;
    this.cause = cause;
  }
}

/** Error thrown when device connection fails */
export class ConnectionError extends QDLError {
  constructor(message, cause) {
    super(message, 'CONNECTION_ERROR', cause);
    this.name = 'ConnectionError';
  }
}

/** Error thrown when USB operations fail */
export class USBError extends QDLError {
  constructor(message, cause) {
    super(message, 'USB_ERROR', cause);
    this.name = 'USBError';
  }
}

/** Error thrown when protocol operations fail */
export class ProtocolError extends QDLError {
  constructor(message, protocol, cause) {
    super(message, 'PROTOCOL_ERROR', cause);
    this.name = 'ProtocolError';
    this.protocol = protocol;
  }
}

/** Error thrown when flash operations fail */
export class FlashError extends QDLError {
  constructor(message, partition, cause) {
    super(message, 'FLASH_ERROR', cause);
    this.name = 'FlashError';
    this.partition = partition;
  }
}

/** Error thrown when GPT operations fail */
export class GPTError extends QDLError {
  constructor(message, lun, cause) {
    super(message, 'GPT_ERROR', cause);
    this.name = 'GPTError';
    this.lun = lun;
  }
}

/** Error thrown when sparse image operations fail */
export class SparseError extends QDLError {
  constructor(message, cause) {
    super(message, 'SPARSE_ERROR', cause);
    this.name = 'SparseError';
  }
}

/** Error thrown when timeout occurs */
export class TimeoutError extends QDLError {
  constructor(message, timeoutMs, cause) {
    super(message, 'TIMEOUT_ERROR', cause);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/** Error thrown when validation fails */
export class ValidationError extends QDLError {
  constructor(message, field, cause) {
    super(message, 'VALIDATION_ERROR', cause);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export { QDLError as default };