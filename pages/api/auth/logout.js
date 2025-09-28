import { logoutUser } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed' });

  logoutUser(res);
  res.status(200).json({ message: 'Logged out' });
}
