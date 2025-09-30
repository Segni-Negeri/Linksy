import { useState } from 'react'
import { AuthUI } from '../components/Auth/AuthUI'

export default function SignUp() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')

  return <AuthUI mode={mode} onModeChange={setMode} />
}
