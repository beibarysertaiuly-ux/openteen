import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LogoSplash = ({ onComplete }) => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Show logo for 1.5 seconds with fade in/out
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(() => {
        onComplete()
      }, 500) // Wait for fade out animation
    }, 1500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-dark flex items-center justify-center z-50"
        >
          <div className="flex items-center gap-4">
            {/* Logo Icon - Globe in Speech Bubble */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-400"></div>
              <div className="absolute inset-2 rounded-full bg-dark flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  className="opacity-90"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
            </div>

            {/* Logo Text with Gradient */}
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                Open
              </span>
              <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                Teens
              </span>
            </h1>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LogoSplash


