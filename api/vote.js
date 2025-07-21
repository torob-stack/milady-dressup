// /pages/api/vote.js
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageId, cookieId, ip } = req.body;

  if (!imageId || !cookieId || !ip) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // Check if already voted
  const { data: existing, error } = await supabase
    .from('votes')
    .select('*')
    .or(`ip.eq.${ip},cookie_id.eq.${cookieId}`)
    .eq('image_id', imageId);

  if (existing && existing.length > 0) {
    return res.status(409).json({ error: 'Already voted' });
  }

  // Insert new vote
  const { error: insertError } = await supabase
    .from('votes')
    .insert([{ image_id: imageId, ip, cookie_id: cookieId }]);

  if (insertError) {
    return res.status(500).json({ error: 'Vote failed' });
  }

  return res.status(200).json({ message: 'Vote registered' });
}
