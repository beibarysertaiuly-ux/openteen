import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import useStore from '../store/useStore'

const Report = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { submitReport } = useStore()

  const isDark = theme === 'dark'
  const bgColor = isDark ? 'bg-dark' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-black'
  const inputBg = isDark ? 'bg-gray-800' : 'bg-gray-100'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50'

  const [reportText, setReportText] = useState('')
  const [reportedUsername, setReportedUsername] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!reportedUsername.trim()) {
      alert('Please enter the username of the person you are reporting')
      return
    }

    if (!reportText.trim()) {
      alert('Please describe the issue')
      return
    }

    submitReport({
      text: reportText,
      reportedUsername: reportedUsername.trim(),
      type: 'user_report'
    })

    setSubmitted(true)
    setTimeout(() => {
      navigate('/settings')
    }, 2000)
  }

  if (submitted) {
    return (
      <div className={`min-h-screen ${bgColor} ${textColor} flex items-center justify-center px-6 pb-24`}>
        <div className={`${cardBg} rounded-lg p-6 text-center max-w-md w-full border-2 border-accent`}>
          <p className="text-xl font-medium mb-2">Report submitted!</p>
          <p className="opacity-70">Thank you for your report. We will review it.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} px-6 py-8 pb-24`}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/settings')} className="text-xl">
            ←
          </button>
          <h1 className="text-2xl font-bold">Report a Problem</h1>
        </div>

        <div className={`${cardBg} rounded-lg p-6 border-2 ${borderColor}`}>
          <p className="mb-4 opacity-70">
            Please provide the username of the person you are reporting and describe the issue.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Username of reported person</label>
            <input
              type="text"
              value={reportedUsername}
              onChange={(e) => setReportedUsername(e.target.value)}
              placeholder="@username"
              className={`w-full py-3 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${borderColor}`}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Describe the issue</label>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe the issue or inappropriate behavior..."
              className={`w-full py-3 px-4 rounded-lg ${inputBg} ${textColor} border-2 ${borderColor} min-h-32`}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/settings')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 ${borderColor} font-medium`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 px-4 rounded-lg bg-accent text-white font-medium"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Report

