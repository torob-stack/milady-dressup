// /api/submit.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageData } = req.body;

  if (!imageData) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  try {
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const cloudinary = require('cloudinary').v2;

    cloudinary.config({
      cloud_name: 'dkoyavida',
      api_key: '892316969548234',
      api_secret: 'FuveqGsTvv0GJy8M3vbHOU0_qiY',
    });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'milady_submissions',
          upload_preset: 'milady_drawings',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
