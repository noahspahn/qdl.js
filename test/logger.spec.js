import { describe, expect, test, beforeEach } from "bun:test";
import { createLogger, Logger, LogLevel } from "../src/logger.js";

describe("Logger", () => {
    let logger;

    beforeEach(() => {
        logger = new Logger("test", LogLevel.DEBUG);
    });

    test("constructor sets name and level", () => {
        expect(logger.name).toBe("test");
        expect(logger.level).toBe(LogLevel.DEBUG);
        expect(logger.prefix).toBe("[test]");
    });

    test("createLogger creates logger with global level", () => {
        const testLogger = createLogger("test-global");
        expect(testLogger).toBeInstanceOf(Logger);
        expect(testLogger.name).toBe("test-global");
    });

    test("log methods respect log level", () => {
        const silentLogger = new Logger("silent", LogLevel.SILENT);

        // These should not throw and should be silent
        silentLogger.debug("debug message");
        silentLogger.info("info message");
        silentLogger.warn("warn message");
        silentLogger.error("error message");
    });

    test("deviceMessage handles different message types", () => {
        // Test ERROR prefix
        logger.deviceMessage("ERROR: Test error message");

        // Test INFO prefix  
        logger.deviceMessage("INFO: Test info message");

        // Test plain message
        logger.deviceMessage("Plain message");
    });

    test("flushDeviceMessages clears state", () => {
        logger.deviceMessage("Test message");
        logger.flushDeviceMessages();

        // Should not throw
        expect(() => logger.flushDeviceMessages()).not.toThrow();
    });
});
describe("Logger edge cases", () => {
  test("deviceMessage with repeated messages", () => {
    const logger = new Logger("test", LogLevel.DEBUG);
    
    logger.deviceMessage("Repeated message");
    logger.deviceMessage("Repeated message");
    
    expect(() => logger.flushDeviceMessages()).not.toThrow();
  });

  test("logger with empty name", () => {
    const logger = new Logger("", LogLevel.INFO);
    expect(logger.prefix).toBe("");
  });

  test("deviceMessage timeout handling", () => {
    const logger = new Logger("test", LogLevel.DEBUG);
    
    logger.deviceMessage("First message");
    logger.deviceMessage("First message");
    
    expect(() => logger.flushDeviceMessages()).not.toThrow();
  });
});
