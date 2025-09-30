import { useState, useEffect } from 'react'
import { AuthUI } from '../components/Auth/AuthUI'
import Link from 'next/link'

// Centered, marketing-like login page using AuthUI

export default function Login() {
  const [mode, setMode] = useState<'signup' | 'login'>('login')
  useEffect(() => {
    document.title = mode === 'login' ? 'Log in — Linksy' : 'Sign up — Linksy'
  }, [mode])

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full text-center text-xs py-2 bg-slate-50 text-slate-500 border-b">MVP Stage - Early Access & Limited Seats</div>
      <nav className="container mx-auto flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-emerald-500 flex items-center justify-center text-white font-bold">⛓️</div>
          <span className="font-semibold text-lg">Linksy</span>
        </div>
        <div className="text-sm">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button className="text-emerald-600 font-medium" onClick={() => setMode('signup')}>Sign Up</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="text-emerald-600 font-medium" onClick={() => setMode('login')}>Log In</button>
            </>
          )}
        </div>
      </nav>
      <AuthUI mode={mode} onModeChange={setMode} />
      <footer className="py-10 text-center text-xs text-slate-400">© {new Date().getFullYear()} Linksy</footer>
    </div>
  )
}
