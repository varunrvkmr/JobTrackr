"use client"

import React from "react"
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom"
import { fetchBackendStatus } from "./services/api"
import JobDashboard from "./components/JobDashboard"
import LetterGenerator from "./components/LetterGenerator"
import JobDetails from "./components/JobDetails"
import UserProfile from "./components/UserProfile";
import "./App.css"
import Login from "./components/Login"
//import Register from "./components/Register"
import PrivateRoute from "./components/PrivateRoute"
import { isAuthenticated } from "src/components/auth"

// Import the enhanced Sidebar
import EnhancedSidebar from "./components/Sidebar"

// Create a layout component that wraps the sidebar and content
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()

  // Determine active sidebar item based on current path
  const getActiveItem = () => {
    const path = location.pathname
  
    if (path === "/jobs") return "jobs"
    if (path.startsWith("/files")) return "files"
    if (path.startsWith("/user-profile")) return "user-profile"
    if (path.startsWith("/letter-generator")) return "letter-generator"
  
    return "jobs" // default to jobs if no match
  }
  

  React.useEffect(() => {
    fetchBackendStatus()
  }, [])

  return (
    <div className="app-container">
      <EnhancedSidebar activeItem={getActiveItem()} />
      <main className="main-content">{children}</main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route: Login: <Route path="/register" element={<Register />} /> */}
        <Route path="/login" element={<Login />} />
        
        {/* Redirect root to jobs or login */}
        <Route
          path="/"
          element={
            isAuthenticated() ? (
              <Navigate to="/jobs" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Private Routes */}
        <Route
          path="/jobs"
          element={
            <PrivateRoute>
              <AppLayout>
                <JobDashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/user-profile"
          element={
            <PrivateRoute>
              <AppLayout>
                <UserProfile />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/letter-generator"
          element={
            <PrivateRoute>
              <AppLayout>
                <LetterGenerator />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/letter-generator/:jobId"
          element={
            <PrivateRoute>
              <AppLayout>
                <JobDetails />
              </AppLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App