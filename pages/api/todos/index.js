const auth = require('../../../lib/auth');
export default function handler(req,res){
  const user = auth.getUserFromReq(req);
  if (!user) return res.status(401).json({message:'Not authenticated'});
  if (req.method === 'GET'){
    const todos = auth.getTodosByUser(user.id);
    return res.status(200).json(todos);
  }
  if (req.method === 'POST'){
    const { title, description, deadline } = req.body;
    if (!title) return res.status(400).json({message:'Missing title'});
    const todo = auth.addTodo(user.id, { title, description, deadline });
    return res.status(200).json(todo);
  }
  res.status(405).json({message:'Method not allowed'});
}
