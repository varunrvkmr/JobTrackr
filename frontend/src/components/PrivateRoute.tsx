
import React from "react"
import { Navigate } from "react-router-dom"
import { isAuthenticated } from "src/components/auth" // adjust path

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />
  }
  return <>{children}</>
}

export default PrivateRoute
