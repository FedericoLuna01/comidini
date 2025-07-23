import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { r2Client, r2Config, validateR2Config } from "../config/r2";
import { ImageUploadResult, ImageUploadOptions, ImageMetadata, ImageType } from "../types/image";

export class ImageService {
  private static readonly DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly DEFAULT_ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  private static readonly DEFAULT_QUALITY = 80;

  static async uploadImage(
    file: Buffer,
    imageType: ImageType,
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    if (!validateR2Config()) {
      throw new Error("R2 configuration is not valid. Please check your environment variables. See env.example for reference.");
    }

    const {
      maxSize = this.DEFAULT_MAX_SIZE,
      allowedTypes = this.DEFAULT_ALLOWED_TYPES,
      resize,
    } = options;

    // Validate file size
    if (file.length > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    // Process image with Sharp
    let processedImage = sharp(file);
    let metadata: ImageMetadata;

    try {
      // Get original metadata
      const originalMetadata = await processedImage.metadata();
      
      // Validate content type - convert format to MIME type
      const formatToMime: Record<string, string> = {
        jpeg: "image/jpeg",
        jpg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
      };
      
      const mimeType = formatToMime[originalMetadata.format || ""];
      if (!mimeType || !allowedTypes.includes(mimeType)) {
        throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(", ")}. Got: ${originalMetadata.format}`);
      }

      // Resize if options provided
      if (resize) {
        const { width, height, quality = this.DEFAULT_QUALITY } = resize;
        
        if (width || height) {
          processedImage = processedImage.resize(width, height, {
            fit: "cover",
            position: "center",
          });
        }

        // Convert to JPEG for better compression
        processedImage = processedImage.jpeg({ quality });
      }

      // Process the image
      const processedBuffer = await processedImage.toBuffer();
      const processedMetadata = await sharp(processedBuffer).metadata();

      metadata = {
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        size: processedBuffer.length,
        format: processedMetadata.format || "jpeg",
        contentType: `image/${processedMetadata.format || "jpeg"}`,
      };

      // Generate unique key
      const key = this.generateKey(imageType, processedMetadata.format || "jpeg");

      // Upload to R2
      const uploadCommand = new PutObjectCommand({
        Bucket: r2Config.bucketName,
        Key: key,
        Body: processedBuffer,
        ContentType: metadata.contentType,
        CacheControl: "public, max-age=31536000", // 1 year cache
      });

      await r2Client.send(uploadCommand);

      const url = `${r2Config.publicUrl}/${key}`;

      return {
        url,
        key,
        size: metadata.size,
        contentType: metadata.contentType,
      };
    } catch (error) {
      console.error("Image upload error:", error);
      
      if (error instanceof Error) {
        // If it's already a formatted error, throw it as is
        if (error.message.includes("File type not allowed") || 
            error.message.includes("File size exceeds") ||
            error.message.includes("R2 configuration is not valid")) {
          throw error;
        }
      }
      
      throw new Error(`Failed to process and upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  static async deleteImage(key: string): Promise<void> {
    if (!validateR2Config()) {
      throw new Error("R2 configuration is not valid. Please check your environment variables. See env.example for reference.");
    }

    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: r2Config.bucketName,
        Key: key,
      });

      await r2Client.send(deleteCommand);
    } catch (error) {
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private static generateKey(imageType: ImageType, format: string): string {
    const timestamp = Date.now();
    const uuid = uuidv4();
    const extension = format === "jpeg" ? "jpg" : format;
    
    return `${imageType}/${timestamp}-${uuid}.${extension}`;
  }

  static getDefaultOptionsForType(imageType: ImageType): ImageUploadOptions {
    switch (imageType) {
      case "user-avatar":
        return {
          maxSize: 2 * 1024 * 1024, // 2MB
          resize: {
            width: 400,
            height: 400,
            quality: 85,
          },
        };
      case "shop-logo":
        return {
          maxSize: 3 * 1024 * 1024, // 3MB
          resize: {
            width: 500,
            height: 500,
            quality: 90,
          },
        };
      case "product-image":
        return {
          maxSize: 5 * 1024 * 1024, // 5MB
          resize: {
            width: 800,
            height: 800,
            quality: 85,
          },
        };
      default:
        return {};
    }
  }
} 