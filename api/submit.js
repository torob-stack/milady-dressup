// /api/submit.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const cloudName = 'dkoyavida';
  const uploadPreset = 'ml_default'; // or a preset you've configured
  const folder = 'milady_submissions';

  try {
    const { imageDataUrl } = req.body;

    const formData = new FormData();
    formData.append('file', imageDataUrl);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.secure_url) {
      return res.status(200).json({ success: true, url: data.secure_url });
    } else {
      return res.status(500).json({ success: false, message: 'Upload failed', data });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
