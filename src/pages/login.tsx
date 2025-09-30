import { useState } from 'react'
import { AuthUI } from '../components/Auth/AuthUI'

export default function Login() {
  const [mode, setMode] = useState<'signup' | 'login'>('login')

  return <AuthUI mode={mode} onModeChange={setMode} />
}
