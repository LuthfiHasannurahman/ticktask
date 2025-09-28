import { supabase } from '../../../lib/auth';
import { getUserFromReq } from '../../../lib/auth';

export default async function handler(req, res) {
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ message: 'Not authenticated' });

  // GET - ambil semua todos milik user
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json(data || []);
  }

  // POST - tambah todo baru
  if (req.method === 'POST') {
    const { title, description, deadline } = req.body;
    const { data, error } = await supabase
      .from('todos')
      .insert([{ title, description, deadline, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
