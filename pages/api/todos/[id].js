const auth = require('../../../lib/auth');
export default function handler(req,res){
  const user = auth.getUserFromReq(req);
  if (!user) return res.status(401).json({message:'Not authenticated'});
  const { id } = req.query;
  if (req.method === 'PUT'){
    const data = req.body;
    try{
      const updated = auth.updateTodo(user.id, id, data);
      return res.status(200).json(updated);
    }catch(e){
      return res.status(404).json({message:e.message});
    }
  }
  if (req.method === 'DELETE'){
    try{
      const d = auth.deleteTodo(user.id, id);
      return res.status(200).json(d);
    }catch(e){
      return res.status(404).json({message:e.message});
    }
  }
  res.status(405).json({message:'Method not allowed'});
}
