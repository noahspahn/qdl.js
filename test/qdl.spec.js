import { describe, expect, test, beforeEach, mock } from "bun:test";
import { qdlDevice } from "../src/qdl.js";

describe("qdlDevice", () => {
  let qdl;
  let mockUsb;
  let programmer;

  beforeEach(() => {
    // Create a minimal valid programmer
    programmer = new ArrayBuffer(1024);
    qdl = new qdlDevice(programmer);

    // Mock USB class
    mockUsb = {
      connected: true,
      connect: mock(() => Promise.resolve()),
      read: mock(() => Promise.resolve(new Uint8Array())),
      write: mock(() => Promise.resolve()),
    };
  });

  test("constructor requires programmer", () => {
    expect(() => new qdlDevice(null)).toThrow("programmer is required");
  });

  test("constructor stores programmer", () => {
    expect(qdl.programmer).toBe(programmer);
    expect(qdl.mode).toBe(null);
    expect(qdl.sahara).toBe(null);
  });

  test("firehose property throws when not configured", () => {
    expect(() => qdl.firehose).toThrow("Firehose not configured");
  });

  describe("error handling", () => {
    test("handles connection failures gracefully", async () => {
      mockUsb.connected = false;
      mockUsb.connect = mock(() => Promise.reject(new Error("USB connection failed")));

      await expect(qdl.connect(mockUsb)).rejects.toThrow("USB connection failed");
    });
  });
});