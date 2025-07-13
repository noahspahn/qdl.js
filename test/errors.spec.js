import { describe, expect, test } from "bun:test";
import {
  QDLError,
  ConnectionError,
  USBError,
  ProtocolError,
  FlashError,
  GPTError,
  SparseError,
  TimeoutError,
  ValidationError
} from "../src/errors.js";

describe("Error Classes", () => {
  test("QDLError base class", () => {
    const error = new QDLError("test message", "TEST_CODE");
    expect(error.name).toBe("QDLError");
    expect(error.message).toBe("test message");
    expect(error.code).toBe("TEST_CODE");
  });

  test("ConnectionError", () => {
    const error = new ConnectionError("connection failed");
    expect(error.name).toBe("ConnectionError");
    expect(error.code).toBe("CONNECTION_ERROR");
    expect(error.message).toBe("connection failed");
  });

  test("USBError", () => {
    const error = new USBError("usb failed");
    expect(error.name).toBe("USBError");
    expect(error.code).toBe("USB_ERROR");
  });

  test("ProtocolError with protocol info", () => {
    const error = new ProtocolError("protocol error", "sahara");
    expect(error.name).toBe("ProtocolError");
    expect(error.protocol).toBe("sahara");
  });

  test("FlashError with partition info", () => {
    const error = new FlashError("flash failed", "boot_a");
    expect(error.name).toBe("FlashError");
    expect(error.partition).toBe("boot_a");
  });

  test("TimeoutError with timeout info", () => {
    const error = new TimeoutError("timeout", 5000);
    expect(error.name).toBe("TimeoutError");
    expect(error.timeoutMs).toBe(5000);
  });
});

describe("Error Classes - Edge Cases", () => {
  test("GPTError with lun info", () => {
    const error = new GPTError("gpt error", 0);
    expect(error.name).toBe("GPTError");
    expect(error.lun).toBe(0);
  });

  test("SparseError", () => {
    const error = new SparseError("sparse failed");
    expect(error.name).toBe("SparseError");
    expect(error.code).toBe("SPARSE_ERROR");
  });

  test("ValidationError with field info", () => {
    const error = new ValidationError("validation failed", "name");
    expect(error.name).toBe("ValidationError");
    expect(error.field).toBe("name");
  });

  test("All error classes inherit from QDLError", () => {
    const connectionError = new ConnectionError("test");
    const usbError = new USBError("test");
    const protocolError = new ProtocolError("test", "sahara");

    expect(connectionError instanceof QDLError).toBe(true);
    expect(usbError instanceof QDLError).toBe(true);
    expect(protocolError instanceof QDLError).toBe(true);
  });
});
describe("Error Classes - Missing Coverage", () => {
  test("GPTError with lun info", () => {
    const error = new GPTError("gpt error", 0);
    expect(error.name).toBe("GPTError");
    expect(error.lun).toBe(0);
  });

  test("SparseError", () => {
    const error = new SparseError("sparse failed");
    expect(error.name).toBe("SparseError");
    expect(error.code).toBe("SPARSE_ERROR");
  });

  test("ValidationError with field info", () => {
    const error = new ValidationError("validation failed", "name");
    expect(error.name).toBe("ValidationError");
    expect(error.field).toBe("name");
  });

  test("All error classes inherit from QDLError", () => {
    const connectionError = new ConnectionError("test");
    const usbError = new USBError("test");
    const protocolError = new ProtocolError("test", "sahara");

    expect(connectionError instanceof QDLError).toBe(true);
    expect(usbError instanceof QDLError).toBe(true);
    expect(protocolError instanceof QDLError).toBe(true);
  });
});
