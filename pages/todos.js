import useSWR from 'swr';
import { useState } from 'react';
import Router from 'next/router';

const fetcher = (url)=>fetch(url).then(r=>r.json());

function formatDateLocal(dt){
  if(!dt) return '';
  const d = new Date(dt);
  return d.toLocaleString();
}

export default function Todos(){
  const {data:user, error:userErr} = useSWR('/api/user', fetcher);
  const {data:todos, mutate} = useSWR('/api/todos', fetcher);
  const [title,setTitle]=useState('');
  const [desc,setDesc]=useState('');
  const [deadline,setDeadline]=useState('');
  const [loading,setLoading]=useState(false);
  const [editId,setEditId]=useState(null);
  const [editTitle,setEditTitle]=useState('');
  const [editDesc,setEditDesc]=useState('');
  const [editDeadline,setEditDeadline]=useState('');

  if (userErr) return <div className="container"><div className="card">Silakan <button onClick={()=>Router.push('/')}>login</button></div></div>;
  if (!user) return <div className="container"><div className="card">Loading...</div></div>;

  async function add(e){
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    await fetch('/api/todos', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({title,description:desc,deadline: deadline || null})
    });
    setTitle(''); setDesc(''); setDeadline(''); setLoading(false);
    mutate();
  }

  async function toggle(id, done){
  await fetch('/api/todos/'+id, {
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ is_done: !done }) 
  });
  mutate();
}

  async function remove(id){
    if(!confirm('Hapus todo ini?')) return;
    await fetch('/api/todos/'+id, { method:'DELETE' });
    mutate();
  }

  function startEdit(t){
    setEditId(t.id);
    setEditTitle(t.title);
    setEditDesc(t.description);
    setEditDeadline(t.deadline? t.deadline.substring(0,16) : '');
  }

  async function saveEdit(e){
    e.preventDefault();
    await fetch('/api/todos/'+editId, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({title: editTitle, description: editDesc, deadline: editDeadline || null})
    });
    setEditId(null);
    mutate();
  }

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <div className="logo">TickTask: Cozy To-Do List</div>
          <div className="small">Daftar ToDo milik {user.name}!</div>
        </div>
        <div>
          <button className="button" onClick={()=>Router.push('/dashboard')}>Dashboard</button>
        </div>
      </div>

      <div className="grid">
        <div className="sidebar card">
          <div>
            <div className="userblock">
              <div className="user-name">{user.name}</div>
              <div className="small">{user.email}</div>
            </div>
            <div className="navitem" onClick={()=>Router.push('/dashboard')}>Dashboard</div>
            <div className="navitem" onClick={()=>Router.push('/todos')}>My ToDos</div>
          </div>
          <div>
            <button className="footer-logout" onClick={async()=>{await fetch('/api/auth/logout',{method:'POST'});Router.push('/')}}>Logout</button>
          </div>
        </div>

        <div>
          <div className="card">
            <h3>Tambah ToDo</h3>
            <form onSubmit={add}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 220px',gap:10}}>
                <div>
                  <label className="small">Judul</label>
                  <input className="input" placeholder="Judul" value={title} onChange={e=>setTitle(e.target.value)} required />
                </div>
                <div>
                  <label className="small">Tenggat</label>
                  <input className="input" type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)} />
                </div>
              </div>
              <div style={{marginTop:8}}>
                <label className="small">Deskripsi</label>
                <textarea className="input" rows={3} placeholder="Deskripsi (opsional)" value={desc} onChange={e=>setDesc(e.target.value)} />
              </div>

          <div style={{display:'flex',justifyContent:'flex-end',marginTop:10}}>
            <button className="button" disabled={loading}>{loading? 'Menambahkan...' : 'Tambah'}</button>
          </div>
            </form>
          </div>

          <div style={{height:12}} />

          <div className="card">
            <h3>Daftar ToDo</h3>
            <div className="todo-list">
              {todos && todos.length===0 && <div className="small">Belum ada ToDo — tambahkan sekarang.</div>}
              {todos && todos.map(t=>(
                <div className="todo" key={t.id}>
                  <div className="left" style={{textDecoration: t.is_done? 'line-through' : 'none'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}>
                      <div style={{fontWeight:800}}>{t.title}</div>
                      <div className="small">{formatDateLocal(t.created_at)}</div>
                    </div>
                    <div className="meta" style={{marginTop:6}}>{t.description}</div>
                    <div style={{marginTop:10, display:'flex',alignItems:'center',gap:10}}>
                      <div className="small">Tenggat:</div>
                      {t.deadline ? (
                        <div className={"badge " + (t.is_done? 'done' : (new Date(t.deadline) < new Date() ? 'deadline' : ((new Date(t.deadline)-new Date()) < 1000*60*60*24*2 ? 'upcoming' : '')))}>
                          {new Date(t.deadline).toLocaleString()}
                        </div>
                      ) : <div className="small">-</div>}
                    </div>

                    <div style={{marginTop:10}}>
                      <div className="progress">
                        <div style={{width: t.is_done? '100%' : (t.deadline? (new Date() > new Date(t.deadline) ? '50%' : '20%') : '10%')}}></div>
                      </div>
                    </div>
                  </div>

                  <div className="right">
                    {editId !== t.id ? (
                      <div className="controls">
                        <div className="control-row">
                          <button className="button" onClick={()=>toggle(t.id, t.is_done)}>{t.is_done? 'Undo' : 'Done'}</button>
                          <button className="footer-logout" onClick={()=>startEdit(t)}>Edit</button>
                        </div>
                        <div className="control-row">
                          <button className="footer-logout" onClick={()=>remove(t.id)}>Hapus</button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={saveEdit}>
                        <div>
                          <input className="input" value={editTitle} onChange={e=>setEditTitle(e.target.value)} required />
                          <input className="input" type="datetime-local" value={editDeadline} onChange={e=>setEditDeadline(e.target.value)} />
                          <textarea className="input" value={editDesc} onChange={e=>setEditDesc(e.target.value)} />
                          <div style={{display:'flex',gap:8,marginTop:8}}>
                            <button className="button" type="submit">Simpan</button>
                            <button className="footer-logout" type="button" onClick={()=>setEditId(null)}>Batal</button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
