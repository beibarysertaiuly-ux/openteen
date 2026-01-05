import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import useStore from '../store/useStore'

const Login = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { loginUser, users } = useStore()
  
  const isDark = theme === 'dark'
  const bgColor = isDark ? 'bg-dark' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-black'
  const inputBg = isDark ? 'bg-gray-800' : 'bg-gray-100'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300'

  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')

  const handleLogin = async () => {
    if (!emailOrUsername || !password) {
      setError('Please enter email/username and password')
      return
    }

    // Find user by email or username
    const user = users.find(u => 
      u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
      u.username.toLowerCase() === emailOrUsername.toLowerCase()
    )
    
    if (!user) {
      setError('User not found')
      return
    }

    // Check password (in real app, this would be hashed)
    if (user.password !== password) {
      setError('Incorrect password')
      return
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      setShowTwoFactor(true)
      return
    }

    // Login successful - check if user is already onboarded
    const { setOnboarded } = useStore.getState()
    const isAlreadyOnboarded = user.profilePic && user.interests && user.interests.length === 5 && user.gender && user.bio
    
    loginUser(user)
    if (isAlreadyOnboarded) {
      setOnboarded(true)
      navigate('/swipe')
    } else {
      setOnboarded(false)
      navigate('/onboarding')
    }
  }

  const handleTwoFactorVerify = () => {
    // Find user by email or username
    const user = users.find(u => 
      u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
      u.username.toLowerCase() === emailOrUsername.toLowerCase()
    )
    
    // Mock 2FA verification (in real app, verify code from server)
    if (twoFactorCode === '123456' || twoFactorCode === user.twoFactorCode) {
      const { setOnboarded } = useStore.getState()
      const isAlreadyOnboarded = user.profilePic && user.interests && user.interests.length === 5 && user.gender && user.bio
      
      loginUser(user)
      if (isAlreadyOnboarded) {
        setOnboarded(true)
        navigate('/swipe')
      } else {
        setOnboarded(false)
        navigate('/onboarding')
      }
    } else {
      setError('Invalid verification code')
    }
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} px-6 py-8 flex items-center justify-center`}>
      <div className="max-w-md w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Log In</h1>
          <p className="opacity-70">Welcome back to OpenTeens</p>
        </div>

        {!showTwoFactor ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email or Username</label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="your@email.com or username"
                className={`w-full py-3 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${borderColor}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full py-3 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${borderColor}`}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              onClick={handleLogin}
              className="w-full py-3 px-6 rounded-lg bg-accent text-white font-medium"
            >
              Log In
            </button>

            <p className="text-center text-sm opacity-70">
              Don't have an account?{' '}
              <Link to="/signup" className="text-accent font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Two-Step Verification</h2>
              <p className="text-sm opacity-70 mb-4">
                Enter the 6-digit code sent to your email
              </p>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className={`w-full py-3 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${borderColor} text-center text-2xl tracking-widest`}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              onClick={handleTwoFactorVerify}
              className="w-full py-3 px-6 rounded-lg bg-accent text-white font-medium"
            >
              Verify
            </button>

            <button
              onClick={() => {
                setShowTwoFactor(false)
                setError('')
              }}
              className="w-full py-3 px-6 rounded-lg border-2 border-accent text-accent font-medium"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login


