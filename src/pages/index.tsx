import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Button } from '../components/ui/Button'
import { motion } from 'framer-motion'
import { useUser } from '../hooks/useUser'
import toast from 'react-hot-toast'

export default function Home() {
  const [url, setUrl] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, loading, signOut } = useUser()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      setShowDropdown(false)
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top banner */}
      <div className="w-full text-center text-xs py-2 bg-slate-50 text-slate-500 border-b">MVP Stage - Early Access & Limited Seats</div>

      {/* Gradient background blob */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-indigo-50" />

        {/* Nav */}
        <nav className="container mx-auto flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-emerald-500 flex items-center justify-center text-white font-bold">⛓️</div>
            <span className="font-semibold text-lg">Linksy</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="User avatar"
                      className="w-8 h-8 rounded-full border-2 border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </button>

                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <Link href="/signup" className="text-emerald-600 font-medium">Sign Up</Link>
                <Link href="/login" className="text-slate-600">Log In</Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero */}
        <header className="container mx-auto px-4 pt-8 pb-16 md:pt-20 md:pb-24">
          <motion.h1 
            className="mx-auto max-w-5xl text-4xl leading-tight font-extrabold tracking-tight text-slate-900 drop-shadow-sm md:text-7xl md:leading-tight text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Transform Your Links
            <br className="hidden md:block" />
            Into a Growth Tool
          </motion.h1>
          <motion.p 
            className="mx-auto mt-6 max-w-3xl text-center text-slate-600 text-base md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Linksy lets you lock your links with custom tasks for your audience — like following, subscribing, or joining — before they can access your content.
          </motion.p>

          {/* CTA form */}
          <motion.form
            className="mx-auto mt-10 flex max-w-3xl items-center gap-3 px-4 md:px-0"
            onSubmit={(e) => { e.preventDefault(); /* navigate later */ }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your URL here"
              className="flex-1 h-12 rounded-md border border-slate-300 bg-white px-4 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Button type="submit" className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">
              Add Tasks
            </Button>
          </motion.form>
        </header>
      </div>

      {/* Footer */}
      <footer className="py-10 text-center text-xs text-slate-400">© {new Date().getFullYear()} Linksy</footer>
    </div>
  )
}


