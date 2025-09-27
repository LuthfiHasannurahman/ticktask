const auth = require('../../../lib/auth');
export default function handler(req,res){
  if(req.method !== 'POST') return res.status(405).json({message:'Method not allowed'});
  auth.removeTokenCookie(res);
  res.status(200).json({message:'ok'});
}
