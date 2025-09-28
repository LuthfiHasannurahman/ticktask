import { registerUser, loginUser, setTokenCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { email, password, name } = req.body;

  try {
    const newUser = await registerUser(email, password, name);
    const { token, user } = await loginUser(email, password);

    setTokenCookie(res, token);
    return res.status(200).json({ user });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(400).json({ message: err.message });
  }
}
