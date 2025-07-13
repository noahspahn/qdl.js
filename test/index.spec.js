import { describe, expect, test } from "bun:test";
import {
  qdlDevice,
  usbClass,
  VERSION,
  validateManifest,
  formatBytes,
  formatDuration,
  isWebUSBSupported,
  isNodeUSBSupported,
  createProgressTracker,
  DEVICE_MANIFESTS
} from "../src/index.js";

describe("Index exports", () => {
  test("main classes exported", () => {
    expect(qdlDevice).toBeDefined();
    expect(usbClass).toBeDefined();
  });

  test("VERSION constant", () => {
    expect(VERSION).toBe("1.0.0");
  });

  test("validateManifest function", () => {
    const validManifest = {
      name: "Test Device",
      programmer: "https://example.com/prog.bin",
      partitions: {
        boot_a: { required: true, description: "Boot A" }
      }
    };
    
    const errors = validateManifest(validManifest);
    expect(errors).toEqual([]);
  });

  test("validateManifest catches errors", () => {
    const invalidManifest = {};
    
    const errors = validateManifest(invalidManifest);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors).toContain("Manifest must have a name");
  });

  test("formatBytes utility", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
  });

  test("formatDuration utility", () => {
    expect(formatDuration(500)).toBe("500ms");
    expect(formatDuration(1500)).toBe("1.5s");
    expect(formatDuration(65000)).toBe("1m 5s");
  });

  test("browser detection utilities", () => {
    expect(typeof isWebUSBSupported()).toBe("boolean");
    expect(typeof isNodeUSBSupported()).toBe("boolean");
  });
});

describe("Index utilities", () => {
  test("createProgressTracker", () => {
    let lastPercent = -1;
    const tracker = createProgressTracker((percent) => {
      lastPercent = percent;
    });

    tracker(50, 100);
    expect(lastPercent).toBe(50);

    tracker(75, 100);
    expect(lastPercent).toBe(75);
  });

  test("createProgressTracker without callback", () => {
    const tracker = createProgressTracker();
    expect(() => tracker(50, 100)).not.toThrow();
  });

  test("formatBytes with decimals", () => {
    expect(formatBytes(1536, 0)).toBe("2 KB");
    expect(formatBytes(1536, 1)).toBe("1.5 KB");
  });

  test("formatDuration edge cases", () => {
    expect(formatDuration(0)).toBe("0ms");
    expect(formatDuration(999)).toBe("999ms");
    expect(formatDuration(59000)).toBe("59.0s");
  });

  test("validateManifest edge cases", () => {
    const invalidPartitions = {
      name: "Test",
      programmer: "https://example.com/prog.bin",
      partitions: {
        invalid1: { required: "not-boolean", description: "test" },
        invalid2: { required: true, description: "" }
      }
    };

    const errors = validateManifest(invalidPartitions);
    expect(errors).toContain("Partition invalid1: 'required' must be a boolean");
    expect(errors).toContain("Partition invalid2: 'description' is required");
  });

  test("DEVICE_MANIFESTS are valid", () => {
    const { COMMA_3, ONEPLUS_6T } = DEVICE_MANIFESTS;
    
    expect(validateManifest(COMMA_3)).toEqual([]);
    expect(validateManifest(ONEPLUS_6T)).toEqual([]);
    
    expect(COMMA_3.name).toBe("comma 3/3X");
    expect(ONEPLUS_6T.name).toBe("OnePlus 6T");
  });

  test("utility functions are exported", () => {
    expect(typeof createProgressTracker).toBe("function");
    expect(typeof formatBytes).toBe("function");
    expect(typeof formatDuration).toBe("function");
    expect(typeof validateManifest).toBe("function");
  });
});
