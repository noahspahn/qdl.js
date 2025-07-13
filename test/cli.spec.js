import { describe, expect, test, mock } from "bun:test";
import { createProgress } from "../src/cli.js";

describe("CLI utilities", () => {
  test("createProgress creates progress function", () => {
    const progress = createProgress(100);
    expect(typeof progress).toBe("function");
  });

  test("createProgress with default total", () => {
    const progress = createProgress();
    expect(typeof progress).toBe("function");
    expect(() => progress(0.5)).not.toThrow();
  });

  test("createProgress handles completion", () => {
    const originalWrite = process.stderr.write;
    let output = "";
    process.stderr.write = mock((data) => {
      output += data;
      return true;
    });

    try {
      const progress = createProgress(100);
      progress(0);
      progress(50);
      progress(100);
      
      expect(output).toContain("%");
    } finally {
      process.stderr.write = originalWrite;
    }
  });

  test("createProgress handles no terminal columns", () => {
    const originalColumns = process.stdout.columns;
    
    try {
      process.stdout.columns = undefined;
      const progress = createProgress(100);
      expect(() => progress(50)).not.toThrow();
    } finally {
      process.stdout.columns = originalColumns;
    }
  });
});
