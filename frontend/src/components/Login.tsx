"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, ArrowRight, Lock, User } from "lucide-react"
import "./auth-page.css"
import { loginUser, registerUser } from "../services/api"
import { Link } from "react-router-dom"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log("Changing:", name, "to", value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isLogin) {
        await loginUser(formData.email, formData.password)
        window.location.href = "/jobs" // or use navigate("/jobs")
      } else {
        // Pass the name along with email and password when registering
        console.log("formData at submit:", formData);
        await registerUser(formData.email, formData.password, formData.username)
        alert("Registration successful! Please sign in.")
        setIsLogin(true)
      }
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">{isLogin ? <Lock className="icon" /> : <User className="icon" />}</div>
          <h2 className="auth-title">{isLogin ? "Welcome" : "Create account"}</h2>
          <p className="auth-subtitle">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="auth-link">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-fields">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Username
                </label>
                <div className="input-container">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required={!isLogin}
                    value={formData.username}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="input-container">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-container">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                  {showPassword ? (
                    <EyeOff className="icon" aria-hidden="true" />
                  ) : (
                    <Eye className="icon" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {isLogin && (
            <div className="form-options">
              <div className="remember-me">
                <input id="remember-me" name="remember-me" type="checkbox" className="checkbox" />
                <label htmlFor="remember-me" className="checkbox-label">
                  Remember me
                </label>
              </div>
              <div className="forgot-password">
                <button
                  type="button"
                  onClick={() => alert("Forgot password functionality coming soon!")}
                  className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          )}

          <div className="form-submit">
            <button type="submit" className="submit-button">
              <span className="button-icon">
                <ArrowRight className="icon" aria-hidden="true" />
              </span>
              {isLogin ? "Sign in" : "Sign up"}
            </button>
          </div>
        </form>

        <div className="social-login">
          <div className="divider">
            <span className="divider-text">Or continue with</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="social-button">
              Google
            </button>
            <button type="button" className="social-button">
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

