import * as auth from '../../../lib/auth.js';

export default async function handler(req, res) {
  const user = auth.getUserFromReq(req);
  if (!user) return res.status(401).json({ message: 'Not authenticated' });
  res.status(200).json(user);
}
