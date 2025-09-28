import { loginUser } from '../../../lib/auth';
import cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Missing credentials' });

    const { token, user } = await loginUser(email, password);

    // simpan JWT ke cookie
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        path: '/',
      })
    );

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(401).json({ message: 'Invalid credentials' });
  }
}
