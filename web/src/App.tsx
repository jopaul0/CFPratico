import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, Plus, Settings, Wallet } from 'lucide-react'

export default function App(){
  const location = useLocation()
  return (
    <div className="min-h-full">
      <header className="header-bar sticky top-0 z-10">
        <div className="container-page flex items-center justify-between gap-3 py-3">
          <div className="text-base font-semibold">CF Prático</div>
          <nav className="flex items-center gap-2">
            <Link to="/" className={`btn ${location.pathname==='/' ? 'btn-primary' : ''}`}><BarChart3 size={18}/> Extrato</Link>
            <Link to="/add" className={`btn ${location.pathname.startsWith('/add') ? 'btn-primary' : ''}`}><Plus size={18}/> Adicionar</Link>
            <Link to="/settings" className={`btn ${location.pathname.startsWith('/settings') ? 'btn-primary' : ''}`}><Settings size={18}/> Config.</Link>
            <Link to="/admin" className={`btn ${location.pathname.startsWith('/admin') ? 'btn-primary' : ''}`}><Wallet size={18}/> Admin</Link>
          </nav>
        </div>
      </header>
      <main className="container-page space-y-4 py-4">
        <Outlet />
      </main>
    </div>
  )
}