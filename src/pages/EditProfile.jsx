import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import useStore from '../store/useStore'
import { compressImage } from '../utils/imageUtils'

const EditProfile = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const {
    currentUser,
    changeDisplayName,
    lastUsernameChange,
    setUser,
  } = useStore()

  const isDark = theme === 'dark'
  const bgColor = isDark ? 'bg-dark' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-black'
  const inputBg = isDark ? 'bg-gray-800' : 'bg-gray-100'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50'

  const [showNameChange, setShowNameChange] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState('')
  const [nameChangeError, setNameChangeError] = useState('')

  const handleNameChange = () => {
    setNameChangeError('')
    
    if (!newDisplayName.trim()) {
      setNameChangeError('Display name cannot be empty')
      return
    }

    if (newDisplayName.length < 2) {
      setNameChangeError('Display name must be at least 2 characters')
      return
    }

    try {
      changeDisplayName(newDisplayName.trim())
      setNewDisplayName('')
      setShowNameChange(false)
      alert('Display name updated successfully!')
    } catch (error) {
      if (error?.message?.toLowerCase().includes('quota')) {
        setNameChangeError('Storage is full. Try uploading a smaller profile photo or clear app data.')
      } else {
        setNameChangeError(error.message)
      }
    }
  }

  const getDaysUntilNameChange = () => {
    if (!lastUsernameChange) return 0
    const now = Date.now()
    const twoWeeks = 14 * 24 * 60 * 60 * 1000
    const timeSince = now - lastUsernameChange
    if (timeSince >= twoWeeks) return 0
    return Math.ceil((twoWeeks - timeSince) / (24 * 60 * 60 * 1000))
  }

  const handleProfilePicChange = async (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    try {
      const compressed = await compressImage(file)
      const updatedUser = {
        ...currentUser,
        profilePic: compressed,
      }
      setUser(updatedUser)
      alert('Profile picture updated!')
    } catch (error) {
      alert('Could not process image. Please try another file.')
    }
  }

  if (!currentUser) {
    return (
      <div className={`min-h-screen ${bgColor} ${textColor} flex items-center justify-center px-6 pb-24`}>
        <div className="text-center">
          <p className="text-xl mb-4">User not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-accent text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} px-6 py-8 pb-24`}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-xl">
            ←
          </button>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>

        {/* Profile Picture */}
        <div className={`${cardBg} rounded-lg p-6 border-2 border-accent mb-6`}>
          <h2 className="font-medium mb-4">Profile Picture</h2>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-gray-300 overflow-hidden border-4 border-accent">
              <img
                src={currentUser.profilePic}
                alt={currentUser.displayName || currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="w-full space-y-2">
              <label className="block w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleProfilePicChange(e.target.files[0])}
                  className="hidden"
                />
                <div className={`w-full py-3 px-4 rounded-lg border-2 ${borderColor} text-center cursor-pointer hover:opacity-80 transition`}>
                  Choose from Device
                </div>
              </label>
              
              <label className="block w-full">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => handleProfilePicChange(e.target.files[0], true)}
                  className="hidden"
                />
                <div className={`w-full py-3 px-4 rounded-lg bg-accent text-white text-center cursor-pointer hover:opacity-80 transition`}>
                  📷 Take Selfie
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Display Name */}
        <div className={`${cardBg} rounded-lg p-6 border-2 border-accent`}>
          <h2 className="font-medium mb-4">Display Name</h2>
          
          {!showNameChange ? (
            <div className="space-y-2">
              <p className="font-medium text-lg">{currentUser.displayName || currentUser.name}</p>
              <button
                onClick={() => setShowNameChange(true)}
                className={`w-full py-2 px-4 rounded-lg border-2 ${borderColor} text-left hover:opacity-80 transition`}
              >
                <p className="font-medium">Change Display Name</p>
                {getDaysUntilNameChange() > 0 ? (
                  <p className="text-sm opacity-70">
                    Available in {getDaysUntilNameChange()} day(s)
                  </p>
                ) : (
                  <p className="text-sm opacity-70">Click to change your display name</p>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => {
                  setNewDisplayName(e.target.value)
                  setNameChangeError('')
                }}
                placeholder="New display name"
                className={`w-full py-2 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${nameChangeError ? 'border-red-500' : borderColor}`}
              />
              {nameChangeError && (
                <p className="text-sm text-red-500">{nameChangeError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowNameChange(false)
                    setNewDisplayName('')
                    setNameChangeError('')
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 ${borderColor}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleNameChange}
                  disabled={getDaysUntilNameChange() > 0}
                  className="flex-1 py-2 px-4 rounded-lg bg-accent text-white disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditProfile

