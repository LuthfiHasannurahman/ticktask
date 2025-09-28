# 🧾 CHANGELOG

## 📦 TickTask — Simple & Cozy To-Do Manager V 1.0.1 — *Stable Release*
**Tanggal:** 28 September 2025  
**Status:** ✅ *Production Ready*

---

✨ **TickTask** adalah aplikasi to-do list modern berbasis **Next.js + Supabase**  
dengan sistem autentikasi **custom JWT**, bukan bawaan Supabase Auth.  
Proyek ini dirancang agar ringan, aman, dan mudah dikembangkan lebih lanjut 🚀

---

## 🧱 Tech Stack
| Layer | Teknologi |
|-------|------------|
| **Frontend** | Next.js (React 18) |
| **Database** | Supabase (PostgreSQL) |
| **Auth System** | JWT (JSON Web Token) dengan Cookie |
| **Deployment** | Netlify |
| **Styling** | Tailwind CSS |

---

## 🌲 Structure
/lib/
 ├── auth.js                # Custom auth logic (register, login, logout)
 ├── supabaseClient.js      # Supabase client untuk query database
/pages/api/
 ├── auth/
 │    ├── login.js          # Endpoint login user
 │    ├── register.js       # Endpoint registrasi user
 │    ├── logout.js         # Endpoint logout
 ├── todos/
 │    ├── index.js          # CRUD utama todos
 │    └── [id].js           # Update / delete todo by ID
 ├── user.js                # Endpoint get user data
/components/
 ├── TodoItem.js            # Komponen untuk tiap todo
 ├── TodoList.js            # Daftar todo lengkap
 ├── ProgressBar.js         # Progress bar status todo

---

👨‍💻 Developer Notes

TickTask v1.0.1 adalah versi stabil dengan dokumentasi lengkap.
Cocok untuk dijadikan portfolio atau base project Supabase + Next.js.

🧡 Dibuat oleh: Luthfi & cak ji
📅 Diperbarui: 28 September 2025
🚀 Built with Next.js, Supabase, and a lot of ☕