import { describe, expect, test } from "bun:test";
import {
    VENDOR_ID,
    PRODUCT_ID,
    USB_CONSTANTS,
    GPT_CONSTANTS,
    SPARSE_CONSTANTS,
    LOG_LEVELS
} from "../src/constants.js";

describe("Constants", () => {
    test("individual USB constants", () => {
        expect(VENDOR_ID).toBe(0x05C6);
        expect(PRODUCT_ID).toBe(0x9008);
    });

    test("USB_CONSTANTS object", () => {
        expect(USB_CONSTANTS.VENDOR_ID).toBe(0x05C6);
        expect(USB_CONSTANTS.PRODUCT_ID).toBe(0x9008);
        expect(USB_CONSTANTS.QDL_CLASS_CODE).toBe(0xFF);
        expect(USB_CONSTANTS.BULK_TRANSFER_SIZE).toBe(16384);
    });

    test("GPT_CONSTANTS", () => {
        expect(GPT_CONSTANTS.SIGNATURE).toBe("EFI PART");
        expect(GPT_CONSTANTS.REVISION).toBe(0x10000);
        expect(GPT_CONSTANTS.TYPE_EFI_UNUSED).toBe("00000000-0000-0000-0000-000000000000");
    });

    test("SPARSE_CONSTANTS", () => {
        expect(SPARSE_CONSTANTS.FILE_MAGIC).toBe(0xed26ff3a);
        expect(SPARSE_CONSTANTS.FILE_HEADER_SIZE).toBe(28);
        expect(SPARSE_CONSTANTS.CHUNK_TYPE_RAW).toBe(0xCAC1);
    });

    test("LOG_LEVELS", () => {
        expect(LOG_LEVELS.SILENT).toBe(0);
        expect(LOG_LEVELS.ERROR).toBe(1);
        expect(LOG_LEVELS.WARN).toBe(2);
        expect(LOG_LEVELS.INFO).toBe(3);
        expect(LOG_LEVELS.DEBUG).toBe(4);
    });
});