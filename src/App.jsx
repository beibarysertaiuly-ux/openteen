import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import useStore from './store/useStore'
import LogoSplash from './components/LogoSplash'
import Splash from './pages/Splash'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Onboarding from './pages/Onboarding'
import SwipeDeck from './pages/SwipeDeck'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import BlockedUsers from './pages/BlockedUsers'
import Report from './pages/Report'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import FriendRequests from './pages/FriendRequests'
import BottomNav from './components/BottomNav'
import FriendRequestNotification from './components/FriendRequestNotification'

function App() {
  const { isAuthenticated, isOnboarded } = useStore()
  const [showLogoSplash, setShowLogoSplash] = useState(true)

  useEffect(() => {
    // Only show logo splash on first load
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash')
    if (hasSeenSplash) {
      setShowLogoSplash(false)
    } else {
      sessionStorage.setItem('hasSeenSplash', 'true')
    }
  }, [])

  if (showLogoSplash) {
    return (
      <ThemeProvider>
        <LogoSplash onComplete={() => setShowLogoSplash(false)} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen">
          <FriendRequestNotification />
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  isOnboarded ? <Navigate to="/swipe" /> : <Navigate to="/onboarding" />
                ) : (
                  <Login />
                )
              } 
            />
            <Route 
              path="/signup" 
              element={
                isAuthenticated ? (
                  isOnboarded ? <Navigate to="/swipe" /> : <Navigate to="/onboarding" />
                ) : (
                  <SignUp />
                )
              } 
            />
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  isOnboarded ? <Navigate to="/swipe" /> : <Navigate to="/onboarding" />
                ) : (
                  <Splash />
                )
              } 
            />
            <Route 
              path="/onboarding" 
              element={
                isAuthenticated ? <Onboarding /> : <Navigate to="/" />
              } 
            />
            <Route 
              path="/swipe" 
              element={
                isAuthenticated && isOnboarded ? (
                  <>
                    <SwipeDeck />
                    <BottomNav />
                  </>
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
            <Route 
              path="/chat" 
              element={
                isAuthenticated && isOnboarded ? (
                  <>
                    <Chat />
                    <BottomNav />
                  </>
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
            <Route 
              path="/settings" 
              element={
                isAuthenticated && isOnboarded ? (
                  <>
                    <Settings />
                    <BottomNav />
                  </>
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
            <Route 
              path="/blocked-users" 
              element={
                isAuthenticated && isOnboarded ? (
                  <BlockedUsers />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
            <Route 
              path="/report" 
              element={
                isAuthenticated && isOnboarded ? (
                  <Report />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
            <Route 
              path="/profile/:userId" 
              element={
                isAuthenticated && isOnboarded ? (
                  <Profile />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
            <Route 
              path="/edit-profile" 
              element={
                isAuthenticated && isOnboarded ? (
                  <EditProfile />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
            <Route 
              path="/friend-requests" 
              element={
                isAuthenticated && isOnboarded ? (
                  <>
                    <FriendRequests />
                    <BottomNav />
                  </>
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App

