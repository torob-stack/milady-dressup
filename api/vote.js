// /api/vote.js
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: image_id } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

  // Create/get cookie ID
  let cookie_id = req.cookies.voter_id;
  if (!cookie_id) {
    cookie_id = uuidv4();
    res.setHeader('Set-Cookie', `voter_id=${cookie_id}; Path=/; Max-Age=31536000`);
  }

  // Prevent duplicate vote
  const { data: existing } = await supabase
    .from('votes')
    .select('*')
    .eq('image_id', image_id)
    .eq('cookie_id', cookie_id)
    .single();

  if (existing) {
    return res.status(200).json({ success: false, message: 'Already voted' });
  }

  // Record vote
  const { error } = await supabase.from('votes').insert([
    {
      image_id,
      cookie_id,
      ip,
    },
  ]);

  if (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }

  return res.status(200).json({ success: true });
}
