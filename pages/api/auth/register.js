const auth = require('../../../lib/auth');

export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).json({message:'Method not allowed'});
  try{
    const { name, email, password } = req.body;
    if(!name || !email || !password) return res.status(400).json({message:'Missing fields'});
    const user = await auth.createUser({name,email,password});
    const token = auth.signToken({ id: user.id, name: user.name, email: user.email });
    auth.setTokenCookie(res, token);
    res.status(200).json({message:'ok', user});
  }catch(e){
    res.status(400).json({message: e.message});
  }
}
