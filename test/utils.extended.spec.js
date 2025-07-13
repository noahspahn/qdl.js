import { describe, expect, test } from "bun:test";
import { packGenerator, concatUint8Array, containsBytes, runWithTimeout } from "../src/utils.js";

describe("utils extended", () => {
    describe("runWithTimeout", () => {
        test("resolves promise within timeout", async () => {
            const promise = Promise.resolve("success");
            const result = await runWithTimeout(promise, 1000);
            expect(result).toBe("success");
        });

        test("rejects when promise times out", async () => {
            const promise = new Promise((resolve) => setTimeout(resolve, 2000));
            await expect(runWithTimeout(promise, 100)).rejects.toThrow("Timed out");
        });
    });

    describe("edge cases", () => {
        test("packGenerator with zero values", () => {
            const result = packGenerator([0, 0, 0]);
            expect(result).toEqual(new Uint8Array(12));
        });

        test("concatUint8Array with single array", () => {
            const arr = new Uint8Array([1, 2, 3]);
            const result = concatUint8Array([arr]);
            expect(result).toEqual(arr);
        });

        test("containsBytes with unicode", () => {
            const input = new TextEncoder().encode("Hello 🌍 World");
            expect(containsBytes("🌍", input)).toBeTrue();
            expect(containsBytes("🚀", input)).toBeFalse();
        });
    });
});