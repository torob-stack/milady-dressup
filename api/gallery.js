// /pages/api/gallery.js
export default async function handler(req, res) {
  const CLOUD_NAME = 'dkoyavida';
  const API_KEY = 'your_api_key_here';
  const API_SECRET = 'your_api_secret_here';
  const FOLDER = 'milady_submissions';

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?prefix=${FOLDER}/&max_results=100`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary API error: ${response.status}`);
    }

    const data = await response.json();

    const images = data.resources.map((img) => ({
      url: img.secure_url,
      alt: img.public_id,
    }));

    res.status(200).json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch images' });
  }
}
