import { getUserFromReq } from '../../lib/auth';

export default async function handler(req, res) {
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ message: 'Not authenticated' });
  res.status(200).json(user);
}
