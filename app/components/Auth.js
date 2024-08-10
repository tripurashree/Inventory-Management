import { useState } from 'react'
import { auth } from '@/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/router'

export default function Auth({ type }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authType, setAuthType] = useState(type)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (authType === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      router.push('/')
    } catch (error) {
      console.error('Error during authentication', error.message) // Log detailed error
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          disabled={loading}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : authType === 'login' ? 'Login' : 'Sign Up'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <div>
        <button onClick={() => setAuthType('login')}>Login</button>
        <button onClick={() => setAuthType('signup')}>Sign Up</button>
      </div>
    </div>
  )
}
