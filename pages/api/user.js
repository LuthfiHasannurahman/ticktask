const auth = require('../../lib/auth');
export default function handler(req,res){
  const user = auth.getUserFromReq(req);
  if (!user) return res.status(401).json({message:'Not authenticated'});
  res.status(200).json(user);
}
