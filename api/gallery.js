// /api/gallery.js
export default async function handler(req, res) {
  const CLOUD_NAME = 'dkoyavida';
  const FOLDER = 'milady_submissions';

  try {
    const response = await fetch(
      `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${FOLDER}.json`
    );

    if (!response.ok) {
      throw new Error(`Cloudinary error: ${response.status}`);
    }

    const data = await response.json();
    const images = data.resources.map((img) => ({
      url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${img.public_id}.${img.format}`,
      alt: img.public_id,
    }));

    res.status(200).json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch images' });
  }
}
