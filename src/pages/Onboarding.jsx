import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import useStore from '../store/useStore'
import { correctInterest } from '../utils/mockData'
import { compressImage } from '../utils/imageUtils'

const Onboarding = () => {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { currentUser, setUser, setOnboarded } = useStore()
  
  const isDark = theme === 'dark'
  const bgColor = isDark ? 'bg-dark' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-black'
  const inputBg = isDark ? 'bg-gray-800' : 'bg-gray-100'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300'

  const [step, setStep] = useState(1)
  const [gender, setGender] = useState('')
  const [profilePic, setProfilePic] = useState('')
  const [profilePicFile, setProfilePicFile] = useState(null)
  const [profilePicError, setProfilePicError] = useState('')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState([])
  const [interestInput, setInterestInput] = useState('')
  const [selectedTheme, setSelectedTheme] = useState(theme)

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setProfilePicError('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setProfilePicError('Image must be less than 5MB')
        return
      }

      try {
        const compressed = await compressImage(file)
        setProfilePicFile(file)
        setProfilePic(compressed)
        setProfilePicError('')
      } catch (error) {
        setProfilePicError('Could not process image. Please try another file.')
      }
    }
  }

  const handleAddInterest = () => {
    if (interests.length >= 5) return
    if (!interestInput.trim()) return
    
    const corrected = correctInterest(interestInput.trim())
    const normalized = corrected.toLowerCase()
    
    if (!interests.map(i => i.toLowerCase()).includes(normalized)) {
      setInterests([...interests, corrected])
      setInterestInput('')
    }
  }

  const handleRemoveInterest = (interest) => {
    setInterests(interests.filter(i => i !== interest))
  }

  const handleContinueFromProfilePic = () => {
    if (!profilePic.trim() && !profilePicFile) {
      setProfilePicError('Profile picture is required')
      return
    }
    setProfilePicError('')
    setStep(3)
  }

  const handleFinish = () => {
    if (!profilePic.trim() && !profilePicFile) {
      setProfilePicError('Profile picture is required')
      setStep(2)
      return
    }
    
    if (interests.length !== 5) {
      setStep(4)
      return
    }

    // Use file data URL if available, otherwise use URL string
    const finalProfilePic = profilePicFile ? profilePic : profilePic.trim()

    const user = {
      ...currentUser,
      gender,
      profilePic: finalProfilePic,
      bio,
      interests,
    }
    
    setUser(user)
    // Add user to allUsers list (for other users to see)
    const { addUser } = useStore.getState()
    addUser(user)
    setTheme(selectedTheme)
    setOnboarded(true)
    
    navigate('/swipe')
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} px-6 py-8 pb-24`}>
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <div className="h-2 bg-gray-300 rounded-full">
            <div 
              className="h-2 bg-accent rounded-full transition-all"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Choose your gender</h2>
            <div className="space-y-3">
              {['Male', 'Female', 'Prefer not to say'].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGender(g)
                    setStep(2)
                  }}
                  className={`w-full py-4 px-6 rounded-lg border-2 ${
                    gender === g ? 'border-accent bg-accent bg-opacity-10' : borderColor
                  } text-left transition`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Upload profile picture</h2>
            <p className="text-sm opacity-70 mb-4">Profile picture is required</p>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full bg-gray-300 overflow-hidden border-2 border-accent">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    📷
                  </div>
                )}
              </div>
              
              {/* File Upload Buttons */}
              <div className="w-full space-y-2">
                <label className="block w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className={`w-full py-3 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${borderColor} text-center cursor-pointer hover:opacity-80 transition`}>
                    {profilePicFile ? 'Change Picture' : 'Choose from Device'}
                  </div>
                </label>
                
                <label className="block w-full">
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className={`w-full py-3 px-4 rounded-lg bg-accent text-white border-2 border-accent text-center cursor-pointer hover:opacity-80 transition`}>
                    📷 Take Selfie
                  </div>
                </label>
              </div>

              {/* Or use URL option */}
              <div className="w-full">
                <p className="text-sm opacity-70 mb-2 text-center">or</p>
                <input
                  type="text"
                  placeholder="Enter image URL"
                  value={profilePic}
                  onChange={(e) => {
                    setProfilePic(e.target.value)
                    setProfilePicFile(null)
                    setProfilePicError('')
                  }}
                  className={`w-full py-3 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${profilePicError ? 'border-red-500' : borderColor}`}
                />
              </div>

              {profilePicError && (
                <p className="text-sm text-red-500">{profilePicError}</p>
              )}
              <button
                onClick={handleContinueFromProfilePic}
                className="w-full py-3 px-6 rounded-lg bg-accent text-white font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Write a short bio</h2>
            <p className="text-sm opacity-70 mb-4">Max 100 characters</p>
            <textarea
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  setBio(e.target.value)
                }
              }}
              placeholder="Tell others about yourself..."
              className={`w-full py-3 px-4 rounded-lg ${inputBg} ${textColor} border ${borderColor} min-h-24`}
              maxLength={100}
            />
            <div className="text-sm opacity-70 text-right">{bio.length}/100</div>
            <button
              onClick={() => setStep(4)}
              className="w-full py-3 px-6 rounded-lg bg-accent text-white font-medium"
            >
              Continue
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Choose exactly 5 interests</h2>
            <p className="text-sm opacity-70 mb-4">{interests.length}/5 selected</p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && interestInput.trim() && interests.length < 5) {
                    handleAddInterest()
                  }
                }}
                placeholder="Type an interest and press Enter"
                className={`flex-1 py-2 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${borderColor}`}
                disabled={interests.length >= 5}
              />
              <button
                onClick={handleAddInterest}
                disabled={interests.length >= 5 || !interestInput.trim()}
                className="py-2 px-4 rounded-lg bg-accent text-white disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 rounded-full bg-accent bg-opacity-20 text-accent flex items-center gap-2 border border-accent"
                  >
                    {interest}
                    <button
                      onClick={() => handleRemoveInterest(interest)}
                      className="text-accent hover:opacity-70"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {interests.length === 5 && (
              <button
                onClick={() => setStep(5)}
                className="w-full py-3 px-6 rounded-lg bg-accent text-white font-medium"
              >
                Continue
              </button>
            )}
            
            {interests.length < 5 && (
              <p className="text-sm opacity-70 text-center">
                You need to add {5 - interests.length} more interest{5 - interests.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Choose color theme</h2>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedTheme('light')}
                className={`w-full py-4 px-6 rounded-lg border-2 ${
                  selectedTheme === 'light' ? 'border-accent bg-accent bg-opacity-10' : borderColor
                } text-left transition flex items-center gap-3`}
              >
                <div className="w-8 h-8 rounded bg-white border-2 border-gray-300"></div>
                <span>Light</span>
              </button>
              <button
                onClick={() => setSelectedTheme('dark')}
                className={`w-full py-4 px-6 rounded-lg border-2 ${
                  selectedTheme === 'dark' ? 'border-accent bg-accent bg-opacity-10' : borderColor
                } text-left transition flex items-center gap-3`}
              >
                <div className="w-8 h-8 rounded bg-dark border-2 border-gray-300"></div>
                <span>Dark</span>
              </button>
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-3 px-6 rounded-lg bg-accent text-white font-medium mt-8"
            >
              Finish Setup
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Onboarding

