// /pages/api/gallery.js
// /api/gallery.js
export default async function handler(req, res) {
  const cloudName = 'dkoyavida';
  const apiKey = 'your_api_key';
  const apiSecret = 'your_api_secret';
  const folder = 'milady_submissions';

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?prefix=${folder}/&max_results=50`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) throw new Error(`Cloudinary error: ${response.status}`);

    const data = await response.json();
    const images = data.resources.map(img => ({
      url: img.secure_url,
      alt: img.public_id,
    }));

    res.status(200).json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch images' });
  }
}

