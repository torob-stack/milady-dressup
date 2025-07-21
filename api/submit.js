// /api/submit.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const CLOUD_NAME = 'dkoyavida';
  const UPLOAD_PRESET = 'milady_drawings';

  const { imageData } = req.body;

  if (!imageData) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: imageData,
        upload_preset: UPLOAD_PRESET
      })
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ message: 'Upload successful', url: data.secure_url });
    } else {
      console.error('Cloudinary Error:', data);
      return res.status(500).json({ error: 'Upload failed', cloudinary: data });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
