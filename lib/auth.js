import { supabase } from './supabaseClient';
import cookie from 'cookie';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const COOKIE_NAME = 'access_token';

// --- REGISTER ---
export async function registerUser(email, password, name) {
  if (!email || !password) throw new Error('Missing email or password');

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) throw new Error('Email already registered');

  const hashed = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password: hashed, name }])
    .select()
    .single();

  if (error) throw error;

  delete data.password;
  return data;
}

// --- LOGIN ---
export async function loginUser(email, password) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error || !user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  delete user.password;
  return { token, user };
}

// --- GET USER ---
export async function getUserFromReq(req) {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies[COOKIE_NAME];
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) return null;

    const { data, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch (err) {
    return null;
  }
}

// --- COOKIE UTILS ---
export function setTokenCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    })
  );
}

export function clearTokenCookie(res) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    })
  );
}
