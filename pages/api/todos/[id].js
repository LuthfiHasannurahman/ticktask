import { supabase } from '../../../lib/auth';
import { getUserFromReq } from '../../../lib/auth';

export default async function handler(req, res) {
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ message: 'Not authenticated' });

  const { id } = req.query;

  // ✅ UPDATE (toggle done / edit todo)
  if (req.method === 'PUT') {
    const { title, description, deadline, is_done } = req.body;

    const { data, error } = await supabase
      .from('todos')
      .update({ 
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(deadline !== undefined && { deadline }),
        ...(is_done !== undefined && { is_done }),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json(data);
  }

  // 🗑️ DELETE
  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({ message: 'Deleted' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
