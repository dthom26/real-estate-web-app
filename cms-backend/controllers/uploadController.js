import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'real-estate' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

export const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const result = await uploadToCloudinary(req.file.buffer);
        res.status(201).json({
            success: true,
            data: { url: result.secure_url },
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        next(error);
    } 
};