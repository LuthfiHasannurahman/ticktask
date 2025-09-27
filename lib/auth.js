const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TODOS_FILE = path.join(DATA_DIR, 'todos.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
if (!fs.existsSync(TODOS_FILE)) fs.writeFileSync(TODOS_FILE, '[]');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_demo_change_me';
const TOKEN_NAME = 'token';

function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8') || '[]'); }
  catch(e){ return []; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

async function createUser({ name, email, password }) {
  const users = readJSON(USERS_FILE);
  const exists = users.find(u => u.email === email);
  if (exists) throw new Error('Email already in use');
  const hashed = await bcrypt.hash(password, 8);
  const user = { id: Date.now().toString(), name, email, password: hashed };
  users.push(user);
  writeJSON(USERS_FILE, users);
  return { id: user.id, name: user.name, email: user.email };
}

async function verifyUser({ email, password }) {
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.email === email);
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid credentials');
  return { id: user.id, name: user.name, email: user.email };
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function setTokenCookie(res, token) {
  const serialized = cookie.serialize(TOKEN_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
  });
  res.setHeader('Set-Cookie', serialized);
}

function removeTokenCookie(res) {
  const serialized = cookie.serialize(TOKEN_NAME, '', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0)
  });
  res.setHeader('Set-Cookie', serialized);
}

function getUserFromReq(req) {
  const cookies = req.headers.cookie;
  if (!cookies) return null;
  const parsed = cookie.parse(cookies || '');
  const token = parsed[TOKEN_NAME];
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    return payload;
  } catch (e) {
    return null;
  }
}

function getTodosByUser(userId) {
  const todos = readJSON(TODOS_FILE);
  return todos.filter(t => t.userId === userId).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}
function addTodo(userId, { title, description, deadline }) {
  const todos = readJSON(TODOS_FILE);
  const todo = {
    id: Date.now().toString(),
    userId,
    title,
    description: description || '',
    done: false,
    createdAt: new Date().toISOString(),
    deadline: deadline || null
  };
  todos.push(todo);
  writeJSON(TODOS_FILE, todos);
  return todo;
}
function updateTodo(userId, id, data) {
  const todos = readJSON(TODOS_FILE);
  const idx = todos.findIndex(t => t.id === id && t.userId === userId);
  if (idx === -1) throw new Error('Not found');
  todos[idx] = { ...todos[idx], ...data };
  writeJSON(TODOS_FILE, todos);
  return todos[idx];
}
function deleteTodo(userId, id) {
  const todos = readJSON(TODOS_FILE);
  const idx = todos.findIndex(t => t.id === id && t.userId === userId);
  if (idx === -1) throw new Error('Not found');
  const deleted = todos.splice(idx,1)[0];
  writeJSON(TODOS_FILE, todos);
  return deleted;
}

module.exports = {
  createUser,
  verifyUser,
  signToken,
  verifyToken,
  setTokenCookie,
  removeTokenCookie,
  getUserFromReq,
  getTodosByUser,
  addTodo,
  updateTodo,
  deleteTodo
};
