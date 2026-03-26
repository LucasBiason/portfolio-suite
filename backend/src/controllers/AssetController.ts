import type { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { buildAssetUrl, mediaRoot } from '../utils/assets';

const UPLOAD_DIR = path.join(mediaRoot, 'uploads');

/**
 * Controller for managing image upload and download by user and tag.
 */
export class AssetController {
  /**
   * Returns the user's directory path.
   */
  private getUserDir(userId: string): string {
    return path.join(UPLOAD_DIR, `user-${userId}`);
  }

  /**
   * Returns the complete file path.
   */
  private getFilePath(userId: string, tag: string, filename: string): string {
    return path.join(this.getUserDir(userId), `${tag}-${filename}`);
  }

  /**
   * Returns the relative file URL for frontend use.
   */
  private getFileUrl(userId: string, tag: string, filename: string): string {
    return `/uploads/user-${userId}/${tag}-${filename}`;
  }

  /**
   * Upload image for a user with a specific tag.
   * POST /api/assets/upload
   * Body: multipart/form-data with "file" field and query param "tag"
   */
  upload = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const tag = req.query.tag as string;
    if (!tag) {
      return res.status(400).json({ error: 'Tag is required. Use ?tag=avatar' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'File not provided.' });
    }

    // Validate file type (images only)
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedMimes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'File type not allowed. Only images are accepted.' });
    }

    try {
      const userDir = this.getUserDir(req.userId);
      
      // Create user directory if it doesn't exist
      await fs.mkdir(userDir, { recursive: true });

      // Check if file with this tag already exists and remove it
      const files = await fs.readdir(userDir);
      const existingFile = files.find(f => f.startsWith(`${tag}-`));
      if (existingFile) {
        await fs.unlink(path.join(userDir, existingFile));
      }

      // Generate unique filename
      const ext = path.extname(file.originalname);
      const timestamp = Date.now();
      const filename = `${timestamp}${ext}`;
      const filePath = this.getFilePath(req.userId, tag, filename);

      // Copy file from temp to final destination (multer may clean temp)
      const fileBuffer = await fs.readFile(file.path);
      await fs.writeFile(filePath, fileBuffer);
      // Remove temporary file
      await fs.unlink(file.path).catch(() => {});

      const fileUrl = this.getFileUrl(req.userId, tag, filename);
      const fullUrl = buildAssetUrl(fileUrl) || fileUrl;

      return res.status(201).json({
        success: true,
        url: fullUrl,
        tag,
        message: 'Image uploaded successfully.',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({ error: 'Error processing image upload.' });
    }
  };

  /**
   * Download/get URL of an image by tag and user.
   * GET /api/assets/:tag
   * Returns the image URL or 404 if not found.
   */
  download = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const tag = req.params.tag;
    if (!tag) {
      return res.status(400).json({ error: 'Tag is required.' });
    }

    try {
      const userDir = this.getUserDir(req.userId);

      // Check if directory exists
      try {
        await fs.access(userDir);
      } catch {
        return res.status(404).json({ error: 'Image not found.' });
      }

      // Find file with the tag
      const files = await fs.readdir(userDir);
      const file = files.find(f => f.startsWith(`${tag}-`));

      if (!file) {
        return res.status(404).json({ error: 'Image not found for this tag.' });
      }

      const fileUrl = this.getFileUrl(req.userId, tag, file.replace(`${tag}-`, ''));
      const fullUrl = buildAssetUrl(fileUrl) || fileUrl;

      return res.json({
        url: fullUrl,
        tag,
      });
    } catch (error) {
      console.error('Error fetching image:', error);
      return res.status(500).json({ error: 'Error processing request.' });
    }
  };

  /**
   * List all images for the authenticated user.
   * GET /api/assets
   */
  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    try {
      const userDir = this.getUserDir(req.userId);

      // Check if directory exists
      try {
        await fs.access(userDir);
      } catch {
        return res.json({ images: [] });
      }

      const files = await fs.readdir(userDir);
      const images = files
        .filter(f => {
          const ext = path.extname(f).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
        })
        .map(file => {
          const [tag, ...rest] = file.split('-');
          const filename = rest.join('-');
          if (!req.userId) {
            throw new Error('User ID is required');
          }
          const fileUrl = this.getFileUrl(req.userId, tag, filename);
          const fullUrl = buildAssetUrl(fileUrl) || fileUrl;
          return {
            tag,
            filename,
            url: fullUrl,
          };
        });

      return res.json({ images });
    } catch (error) {
      console.error('Error listing images:', error);
      return res.status(500).json({ error: 'Error processing request.' });
    }
  };

  /**
   * Remove an image by tag.
   * DELETE /api/assets/:tag
   */
  delete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const tag = req.params.tag;
    if (!tag) {
      return res.status(400).json({ error: 'Tag is required.' });
    }

    try {
      const userDir = this.getUserDir(req.userId);

      // Check if directory exists
      try {
        await fs.access(userDir);
      } catch {
        return res.status(404).json({ error: 'Image not found.' });
      }

      // Find file with the tag
      const files = await fs.readdir(userDir);
      const file = files.find(f => f.startsWith(`${tag}-`));

      if (!file) {
        return res.status(404).json({ error: 'Image not found for this tag.' });
      }

      await fs.unlink(path.join(userDir, file));

      return res.status(204).send();
    } catch (error) {
      console.error('Error removing image:', error);
      return res.status(500).json({ error: 'Error processing request.' });
    }
  };
}

