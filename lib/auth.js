import { createClient } from '@supabase/supabase-js';
import cookie from 'cookie';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// === ENVIRONMENT VARIABLES ===
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// === INIT SUPABASE CLIENT ===
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// === REGISTER ===
export async function registerUser(email, password, name) {
  // cek apakah email sudah ada
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existing) throw new Error('Email already registered');

  // hash password
  const hashed = await bcrypt.hash(password, 10);

  // simpan user baru
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password: hashed, name }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// === LOGIN ===
export async function loginUser(email, password) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  // buat token JWT lokal
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, user };
}

// === GET USER FROM COOKIE ===
export function getUserFromReq(req) {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies['access_token'];
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

// === LOGOUT ===
export function logoutUser(res) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      sameSite: 'lax',
      path: '/',
    })
  );
}
