import Link from 'next/link'
import { useState } from 'react'
import { Button } from '../components/ui/Button'

export default function Home() {
  const [url, setUrl] = useState('')

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
            <Link href="#" className="text-emerald-600 font-medium">Sign Up</Link>
            <Link href="#" className="text-slate-600">Log In</Link>
          </div>
        </nav>

        {/* Hero */}
        <header className="container mx-auto px-4 pt-8 pb-16 md:pt-20 md:pb-24">
          <h1 className="mx-auto max-w-5xl text-4xl leading-tight font-extrabold tracking-tight text-slate-900 drop-shadow-sm md:text-7xl md:leading-tight text-center">
            Transform Your Links
            <br className="hidden md:block" />
            Into a Growth Tool
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-center text-slate-600 text-base md:text-lg">
            Linksy lets you lock your links with custom tasks for your audience — like following, subscribing, or joining — before they can access your content.
          </p>

          {/* CTA form */}
          <form
            className="mx-auto mt-10 flex max-w-3xl items-center gap-3 px-4 md:px-0"
            onSubmit={(e) => { e.preventDefault(); /* navigate later */ }}
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
          </form>
        </header>
      </div>

      {/* Footer */}
      <footer className="py-10 text-center text-xs text-slate-400">© {new Date().getFullYear()} Linksy</footer>
    </div>
  )
}


