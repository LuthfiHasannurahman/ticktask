import { useState } from 'react';
import Router from 'next/router';

export default function Home(){
  const [isRegister,setIsRegister] = useState(false);
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [err,setErr] = useState('');

  async function submit(e){
    e.preventDefault();
    setErr('');
    try{
      const url = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(url, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(isRegister ? {name,email,password} : {email,password})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Error');
      Router.push('/dashboard');
    }catch(e){
      setErr(e.message);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:900, margin:'0 auto', display:'flex', gap:20, alignItems:'center'}}>
        <div style={{flex:1, padding:20}}>
          <div className="logo">TickTask: To-Do List & Reminder</div>
          <div style={{marginTop:10, fontSize:18, fontWeight:700}}>Organize your day. Stay focused.</div>
          <p className="small" style={{marginTop:8}}>Buat akun untuk menyimpan TickTask kamu dan kembali lagi kapan pun.</p>
          <div style={{marginTop:18}}>
            <button className="button" onClick={()=>setIsRegister(s=>!s)}>{isRegister? 'Sudah punya akun? Login' : 'Belum punya? Daftar'}</button>
          </div>
        </div>

        <div style={{width:360, padding:20, borderLeft:'1px solid rgba(16,24,40,0.03)'}}>
          <h3 style={{margin:0}}>{isRegister? 'Daftar' : 'Masuk'}</h3>
          <form onSubmit={submit} style={{marginTop:12}}>
            {isRegister && (
              <div>
                <label className="small">Nama lengkap</label>
                <input className="input" value={name} onChange={e=>setName(e.target.value)} required />
              </div>
            )}
            <div style={{marginTop:8}}>
              <label className="small">Email</label>
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div style={{marginTop:8}}>
              <label className="small">Password</label>
              <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>

            {err && <div style={{color:'#ef4444', marginTop:8}}>{err}</div>}

            <div style={{marginTop:12, display:'flex', justifyContent:'flex-end'}}>
              <button className="button" type="submit">{isRegister? 'Buat Akun' : 'Masuk'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
