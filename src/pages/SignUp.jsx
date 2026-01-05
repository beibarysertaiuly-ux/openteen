import { useState, useEffect } from 'react'
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
  const [allowLocation, setAllowLocation] = useState(null) // null = not asked yet, true = allowed, false = denied
  const [selectedCountry, setSelectedCountry] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // List of countries for manual selection
  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'New Zealand',
    'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Portugal', 'Greece',
    'Japan', 'South Korea', 'China', 'India', 'Singapore', 'Thailand', 'Philippines', 'Indonesia', 'Malaysia', 'Vietnam',
    'Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela', 'Ecuador', 'Uruguay', 'Paraguay',
    'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Morocco', 'Ghana', 'Tanzania', 'Ethiopia',
    'Russia', 'Turkey', 'Saudi Arabia', 'United Arab Emirates', 'Israel', 'Lebanon', 'Jordan', 'Qatar', 'Kuwait',
    'Ukraine', 'Romania', 'Czech Republic', 'Hungary', 'Bulgaria', 'Croatia', 'Serbia', 'Slovakia', 'Slovenia',
    'Other'
  ]

  // Detect location only if user allows it
  useEffect(() => {
    if (allowLocation === true) {
      detectLocation()
    }
  }, [allowLocation])

  const detectLocation = async () => {
    setLoading(true)
    try {
      // Try to get location from browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            
            // Use a free geocoding API to get location from coordinates
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              )
              const data = await response.json()
              
              const detectedLocation = {
                country: data.countryName || 'Unknown',
                city: data.city || data.locality || 'Unknown',
                latitude,
                longitude,
              }
              setLocation(detectedLocation)
            } catch (geoError) {
              // Fallback if geocoding fails
              const fallbackLocation = {
                country: 'Unknown',
                city: 'Unknown',
                latitude,
                longitude,
              }
              setLocation(fallbackLocation)
            }
            setLoading(false)
          },
          async () => {
            // If geolocation denied, try IP-based detection
            try {
              const response = await fetch('https://ipapi.co/json/')
              const data = await response.json()
              
              const ipLocation = {
                country: data.country_name || 'Unknown',
                city: data.city || 'Unknown',
                latitude: data.latitude || null,
                longitude: data.longitude || null,
              }
              setLocation(ipLocation)
            } catch (ipError) {
              // If IP detection fails, user needs to select manually
              setAllowLocation(false)
            }
            setLoading(false)
          }
        )
      } else {
        // Try IP-based detection if geolocation not available
        try {
          const response = await fetch('https://ipapi.co/json/')
          const data = await response.json()
          
          const ipLocation = {
            country: data.country_name || 'Unknown',
            city: data.city || 'Unknown',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
          }
          setLocation(ipLocation)
        } catch (ipError) {
          // If IP detection fails, user needs to select manually
          setAllowLocation(false)
        }
        setLoading(false)
      }
    } catch (error) {
      // Final fallback - let user select manually
      setAllowLocation(false)
      setLoading(false)
    }
  }

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
      setError('Please allow location access or select your country manually')
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
      twoFactorEnabled: false,
      twoFactorCode: null,
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
          <p className="opacity-70">Create your OpenTeens account</p>
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
                  if (val === '' || (!isNaN(num) && num >= 10 && num <= 19)) {
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

          {/* Location permission section */}
          {allowLocation === null && (
            <div className={`p-4 rounded-lg ${inputBg} border-2 ${borderColor}`}>
              <p className="text-sm font-medium mb-3">Location Access</p>
              <p className="text-xs opacity-70 mb-4">
                We need your location to help you find matches nearby. You can also choose your country manually.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAllowLocation(true)
                    setLoading(true)
                  }}
                  className="flex-1 py-2 px-4 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition"
                >
                  Allow Location
                </button>
                <button
                  onClick={() => setAllowLocation(false)}
                  className="flex-1 py-2 px-4 rounded-lg border-2 border-accent text-accent font-medium hover:opacity-80 transition"
                >
                  Choose Manually
                </button>
              </div>
            </div>
          )}

          {/* Manual country selection */}
          {allowLocation === false && (
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
                  }
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
              <button
                onClick={() => {
                  setAllowLocation(null)
                  setSelectedCountry('')
                  setLocation(null)
                }}
                className="mt-2 text-sm text-accent hover:opacity-80 transition"
              >
                ← Use automatic detection instead
              </button>
            </div>
          )}

          {/* Detected location display */}
          {allowLocation === true && location && (
            <div className={`p-3 rounded-lg ${inputBg} border-2 ${borderColor}`}>
              <p className="text-sm opacity-70">Detected Location:</p>
              <p className="font-medium">{location.city}, {location.country}</p>
              <button
                onClick={() => {
                  setAllowLocation(false)
                  setLocation(null)
                }}
                className="mt-2 text-sm text-accent hover:opacity-80 transition"
              >
                Change to manual selection
              </button>
            </div>
          )}

          {allowLocation === true && loading && (
            <div className={`p-3 rounded-lg ${inputBg} border-2 ${borderColor}`}>
              <p className="text-sm opacity-70">Detecting your location...</p>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full py-3 px-6 rounded-lg bg-accent text-white font-medium disabled:opacity-50"
          >
            {loading ? 'Detecting location...' : 'Sign Up'}
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

