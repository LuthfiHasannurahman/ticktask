import useSWR from 'swr';
import Router from 'next/router';

const fetcher = (url)=>fetch(url).then(r=>r.json());

export default function Dashboard(){
  const {data:user, error:userErr} = useSWR('/api/user', fetcher);
  const {data:todos} = useSWR('/api/todos', fetcher);

  if (userErr) return <div className="container"><div className="card">Silakan <button onClick={()=>Router.push('/')}>login</button></div></div>;
  if (!user) return <div className="container"><div className="card">Loading...</div></div>;

  const total = todos? todos.length : 0;
  const done = todos? todos.filter(t=>t.done).length : 0;
  const progress = total === 0 ? 0 : Math.round((done/total)*100);

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <div className="logo">TickTask: Cozy To-Do List</div>
          <div className="small">Halo, {user.name}! Semoga Harimu Menyenangkan:3</div>
        </div>
        <div>
          <button className="button" onClick={()=>Router.push('/todos')}>Buka My ToDos</button>
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
            <div className="navitem" onClick={()=>Router.push('/todos')}>My ToDos ({total})</div>
          </div>
          <div>
            <button className="footer-logout" onClick={async()=>{await fetch('/api/auth/logout',{method:'POST'});Router.push('/')}}>Logout</button>
          </div>
        </div>

        <div>
          <div className="card">
            <h3>Ringkasan ToDo</h3>
            <p className="small">Total ToDo: <b>{total}</b> — Selesai: <b>{done}</b></p>

            <div style={{marginTop:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div className="small">Progress</div>
                <div style={{fontWeight:800}}>{progress}%</div>
              </div>
              <div className="progress" style={{marginTop:8}}>
                <div style={{width: progress + '%'}}></div>
              </div>
            </div>
          </div>

          <div style={{height:12}} />

          <div className="card">
            <h3>ToDo Terbaru</h3>
            <div className="todo-list">
              {todos && todos.length===0 && <div className="small">Belum ada ToDo.</div>}
              {todos && todos.slice(0,5).map(t=>(
                <div className="todo" key={t.id}>
                  <div className="left">
                    <div style={{fontWeight:700}}>{t.title}</div>
                    <div className="meta">{t.description}</div>
                    <div style={{marginTop:8}} className="small">Dibuat: {new Date(t.createdAt).toLocaleString()} {t.deadline && <>• Tenggat: {new Date(t.deadline).toLocaleString()}</>}</div>
                  </div>
                  <div className="right">
                    <div className={"badge " + (t.done? 'done' : (t.deadline && new Date(t.deadline) < new Date() ? 'deadline' : (t.deadline && (new Date(t.deadline) - new Date()) < 1000*60*60*24*2 ? 'upcoming' : '')))}>
                      {t.done? 'Done' : (t.deadline && new Date(t.deadline) < new Date() ? 'Overdue' : (t.deadline? 'Open' : 'No deadline'))}
                    </div>
                    <div className="small">{t.done? 'Selesai' : ''}</div>
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