import { useState, useEffect } from 'react'
import axios from 'axios'

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check if there's a token in localStorage
    const storedToken = localStorage.getItem('authToken')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const login = async (username: string, password: string) => {
    try {
      // Replace this with your actual authentication endpoint
      const response = await axios.post('http://your-api-base-url/login', { username, password })
      const newToken = response.data.token
      setToken(newToken)
      localStorage.setItem('authToken', newToken)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('authToken')
  }

  return { token, login, logout }
}
