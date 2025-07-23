import { Router, Request, Response } from "express";
import multer from "multer";
import { ImageService } from "@repo/storage";
import { requireAuth } from "../middlewares/requireAuth";
import { z } from "zod";

const router: Router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Check file type
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// Schema for upload request
const uploadSchema = z.object({
  type: z.enum(["user-avatar", "shop-logo", "product-image"]),
});

// Upload image endpoint
router.post("/image", requireAuth, upload.single("image"), async (req: any, res: Response): Promise<void> => {
  try {
    // Validate request
    const { type } = uploadSchema.parse(req.body);
    
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    // Get default options for the image type
    const options = ImageService.getDefaultOptionsForType(type);

    // Upload image to R2
    const result = await ImageService.uploadImage(req.file.buffer, type, options);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Upload error:", error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request data" });
      return;
    }
    
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete image endpoint
router.delete("/image/:key", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    
    if (!key) {
      res.status(400).json({ error: "Image key is required" });
      return;
    }

    await ImageService.deleteImage(key);

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router; 