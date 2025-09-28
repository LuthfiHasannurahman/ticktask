import { supabase } from '../../../lib/supabaseClient';
import { getUserFromReq } from '../../../lib/auth';

export default async function handler(req, res) {
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ message: 'Not authenticated' });

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json(data || []);
  }

  if (req.method === 'POST') {
    const { title, description, deadline } = req.body;

    const { data, error } = await supabase
      .from('todos')
      .insert([{ title, description, deadline, is_done: false, user_id: user.id }])
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json(data);
  }

  res.status(405).json({ message: 'Method not allowed' });
}
