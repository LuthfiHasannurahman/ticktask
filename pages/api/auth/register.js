import { registerUser } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { email, password, name } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Missing credentials' });

    const user = await registerUser(email, password, name);
    res.status(200).json({ message: 'User registered', user });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(400).json({ message: err.message });
  }
}
