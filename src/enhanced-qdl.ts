import { qdlDevice } from './qdl.js';
import { createLogger } from './logger.js';
import type { 
  FlashConfig, 
  FlashResult, 
  DeviceInfo, 
} from './types.js';
import { FlashError, ValidationError } from './errors.js';

const logger = createLogger('enhanced-qdl');

/**
 * Enhanced QDL device with additional utilities and error handling
 */
export class EnhancedQDLDevice extends qdlDevice {
  private _deviceInfo: DeviceInfo | null = null;

  /**
   * Get cached device info or fetch if not available
   */
  async getDeviceInfoCached(): Promise<DeviceInfo> {
    if (!this._deviceInfo) {
      this._deviceInfo = await this.fetchDeviceInfo();
    }
    return this._deviceInfo;
  }

  /**
   * Fetch fresh device information
   */
  private async fetchDeviceInfo(): Promise<DeviceInfo> {
    const [activeSlot, storage] = await Promise.all([
      this.getActiveSlot(),
      this.getStorageInfo()
    ]);

    const [slotsCount, partitions] = await this.getDevicePartitionsInfo();

    return {
      activeSlot,
      storage,
      serial: this.sahara?.serial,
      partitions,
      slots: slotsCount > 0 ? ['a', 'b'] : []
    };
  }

  /**
   * Flash partition with enhanced error handling and progress tracking
   */
  async flashPartitionEnhanced(
    name: string, 
    image: Blob | File, 
    config: FlashConfig = {}
  ): Promise<FlashResult> {
    const startTime = Date.now();
    let bytesTransferred = 0;

    try {
      // Validate inputs
      if (!name) {
        throw new ValidationError('Partition name is required');
      }
      if (!image || image.size === 0) {
        throw new ValidationError('Image is required and must not be empty');
      }

      // Create progress tracker
      const progressTracker = (bytes: number) => {
        bytesTransferred = bytes;
        const percent = (bytes / image.size) * 100;
        config.onProgress?.(percent);
      };

      logger.info(`Starting flash of ${name} (${image.size} bytes)`);

      const success = await this.flashBlob(
        name, 
        image, 
        progressTracker, 
        config.eraseBeforeFlashSparse
      );

      const duration = Date.now() - startTime;

      if (success) {
        logger.info(`Successfully flashed ${name} in ${duration}ms`);
        return {
          success: true,
          bytesTransferred: image.size,
          duration
        };
      } else {
        throw new FlashError(`Flash operation failed for partition ${name}`, name);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error(`Flash failed for ${name}: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
        bytesTransferred,
        duration
      };
    }
  }

  /**
   * Erase partition with enhanced options
   */
  async erasePartitionEnhanced(name: string): Promise<boolean> {
    try {
      logger.info(`Erasing partition ${name}`);
      
      // For now, use the basic erase method
      // Could be enhanced to support options.preserveGpt, etc.
      const success = await this.erase(name);
      
      if (success) {
        logger.info(`Successfully erased ${name}`);
      } else {
        logger.error(`Failed to erase ${name}`);
      }
      
      return success;
    } catch (error) {
      logger.error(`Error erasing ${name}:`, error);
      return false;
    }
  }

  /**
   * Validate partition exists before operation
   */
  async validatePartition(name: string): Promise<boolean> {
    try {
      const [found] = await this.detectPartition(name);
      return found;
    } catch {
      return false;
    }
  }

  /**
   * Get partition information
   */
  async getPartitionInfo(name: string) {
    const [found, lun, partition, gpt] = await this.detectPartition(name);
    if (!found) {
      throw new ValidationError(`Partition ${name} not found`);
    }
    return { lun, partition, gpt };
  }

  /**
   * Switch slot and verify
   */
  async switchSlotSafe(slot: "a" | "b"): Promise<boolean> {
    try {
      logger.info(`Switching to slot ${slot}`);
      
      const success = await this.setActiveSlot(slot);
      if (!success) return false;

      // Verify the switch
      const currentSlot = await this.getActiveSlot();
      if (currentSlot !== slot) {
        logger.error(`Slot switch verification failed: expected ${slot}, got ${currentSlot}`);
        return false;
      }

      logger.info(`Successfully switched to slot ${slot}`);
      return true;
    } catch (error) {
      logger.error(`Failed to switch to slot ${slot}:`, error);
      return false;
    }
  }

  /**
   * Clear device info cache
   */
  clearCache(): void {
    this._deviceInfo = null;
  }
}

// Example usage and utilities
export const QDLUtils = {
  /**
   * Create an enhanced QDL device
   */
  createEnhanced(programmer: ArrayBuffer): EnhancedQDLDevice {
    return new EnhancedQDLDevice(programmer);
  },

  /**
   * Batch flash multiple partitions
   */
  async batchFlash(
    device: qdlDevice,
    partitions: Array<{ name: string; image: Blob | File }>,
    onProgress?: (partition: string, percent: number) => void
  ): Promise<FlashResult[]> {
    const results: FlashResult[] = [];

    for (const { name, image } of partitions) {
      const result = await (device as EnhancedQDLDevice).flashPartitionEnhanced(name, image, {
        onProgress: (percent) => onProgress?.(name, percent)
      });
      results.push(result);
      
      if (!result.success) {
        logger.warn(`Stopping batch flash due to failure on ${name}`);
        break;
      }
    }

    return results;
  },

  /**
   * Verify all required partitions exist
   */
  async verifyPartitions(device: qdlDevice, requiredPartitions: string[]): Promise<string[]> {
    const missing: string[] = [];

    for (const partition of requiredPartitions) {
      const [found] = await device.detectPartition(partition);
      if (!found) {
        missing.push(partition);
      }
    }

    return missing;
  }
};