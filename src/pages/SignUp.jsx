import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import useStore from '../store/useStore'

const SignUp = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { registerUser, users } = useStore()
  
  const isDark = theme === 'dark'
  const bgColor = isDark ? 'bg-dark' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-black'
  const inputBg = isDark ? 'bg-gray-800' : 'bg-gray-100'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300'

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [age, setAge] = useState('')
  const [location, setLocation] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [error, setError] = useState('')

  // List of countries for manual selection
  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'New Zealand',
    'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Portugal', 'Greece',
    'Japan', 'South Korea', 'China', 'India', 'Singapore', 'Thailand', 'Philippines', 'Indonesia', 'Malaysia', 'Vietnam',
    'Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela', 'Ecuador', 'Uruguay', 'Paraguay',
    'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Morocco', 'Ghana', 'Tanzania', 'Ethiopia',
    'Russia', 'Turkey', 'Saudi Arabia', 'United Arab Emirates', 'Israel', 'Lebanon', 'Jordan', 'Qatar', 'Kuwait',
    'Ukraine', 'Romania', 'Czech Republic', 'Hungary', 'Bulgaria', 'Croatia', 'Serbia', 'Slovakia', 'Slovenia',
    'Kazakhstan', 'Other'
  ]

  const handleSignUp = () => {
    setError('')

    // Validation
    if (!username || !displayName || !email || !password || !age) {
      setError('Please fill in all fields')
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const ageNum = parseInt(age)
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 19) {
      setError('Age must be between 10 and 19')
      return
    }

    // Check if username or email already exists
    if (users.some(u => u.username === username)) {
      setError('Username already taken')
      return
    }

    if (users.some(u => u.email === email)) {
      setError('Email already registered')
      return
    }

    // Validate location
    if (!location || !location.country || location.country === 'Unknown') {
      setError('Please select a country')
      return
    }

    // Create user
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      displayName,
      name: displayName, // For compatibility
      email,
      password, // In real app, this would be hashed
      age: ageNum,
      location: location || { country: 'Unknown', city: 'Unknown' },
      createdAt: Date.now(),
    }

    registerUser(newUser)
    navigate('/onboarding')
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} px-6 py-8 flex items-center justify-center`}>
      <div className="max-w-md w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sign Up</h1>
          <p className="opacity-70">Create a browser-local test account. Use sample details and a disposable password.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="username"
              className={`w-full py-3 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${borderColor}`}
            />
            <p className="text-xs opacity-70 mt-1">Only letters, numbers, and underscores</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className={`w-full py-3 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${borderColor}`}
            />
            <p className="text-xs opacity-70 mt-1">This is how others will see you</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={`w-full py-3 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${borderColor}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={`w-full py-3 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${borderColor}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className={`w-full py-3 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${borderColor}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Age</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={age}
                onChange={(e) => {
                  const val = e.target.value
                  const num = parseInt(val)
                  // Prevent entry if outside range
                  if (val === '' || (/^\d{1,2}$/.test(val))) {
                    setAge(val)
                  }
                }}
                placeholder="10-19"
                min="10"
                max="19"
                className={`flex-1 py-3 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${borderColor} text-center text-2xl`}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <button
                type="button"
                onClick={() => {
                  const num = parseInt(age) || 10
                  if (num > 10) {
                    setAge((num - 1).toString())
                  }
                }}
                className="px-4 py-2 rounded-lg border-2 border-accent text-accent font-medium hover:opacity-80 transition"
              >
                ←
              </button>
              <p className="text-xs opacity-70">Must be between 10 and 19</p>
              <button
                type="button"
                onClick={() => {
                  const num = parseInt(age) || 10
                  if (num < 19) {
                    setAge((num + 1).toString())
                  }
                }}
                className="px-4 py-2 rounded-lg border-2 border-accent text-accent font-medium hover:opacity-80 transition"
              >
                →
              </button>
            </div>
          </div>

          {/* Manual country selection */}

            <div>
              <label className="block text-sm font-medium mb-2">Select Your Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value)
                  if (e.target.value) {
                    setLocation({
                      country: e.target.value,
                      city: 'Unknown',
                      latitude: null,
                      longitude: null,
                    })
                  } else { setLocation(null) }
                }}
                className={`w-full py-3 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${borderColor}`}
              >
                <option value="">Select a country...</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

            </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleSignUp}
            className="w-full py-3 px-6 rounded-lg bg-accent text-white font-medium disabled:opacity-50"
          >
            Sign Up
          </button>

          <p className="text-center text-sm opacity-70">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp

