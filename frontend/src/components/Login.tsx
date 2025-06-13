"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, ArrowRight, Lock, User, Mail, Phone, MapPin } from "lucide-react"
import "./auth-page.css"
import { loginUser, registerUser, fetchCurrentUserProfile } from "../services/api"
import { useNavigate } from "react-router-dom"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
    location: ""  // this will map to `city` in the DB for now
  })

  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log("Changing:", name, "to", value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        const data = await loginUser(formData.email, formData.password);
        console.log(data);

        if (data?.message === "Login successful") {
          console.log("frontend(login.tsx) - login successful, checking user profile...");

          try {
            await fetchCurrentUserProfile(); // check if user profile exists
            console.log("✅ Profile found — redirecting to /jobs");
            navigate("/jobs");
          } catch (err: any) {
            if (err.message.includes("404") || err.message.toLowerCase().includes("profile not found")) {
              console.log("🆕 No profile found — redirecting to /user-profile");
              navigate("/user-profile"); // prompt user to fill profile
            } else {
              console.error("Unexpected error checking profile:", err);
              alert("An unexpected error occurred. Please try again.");
            }
          }

        } else {
          alert("Login failed. Please try again.");
        }
      } else {
        console.log("formData at submit:", formData);
        await registerUser(
          formData.email,
          formData.password,
          formData.username,
          formData.first_name,
          formData.last_name,
          formData.phone,
          formData.location
        );
        alert("Registration successful! Please sign in.");
        setIsLogin(true);
        setFormData((prev) => ({
          ...prev,
          email: prev.email,
          password: prev.password,
          username: "",
          first_name: "",
          last_name: "",
          phone: "",
          location: ""
        }));
        // Optional: focus password field
        document.getElementById("password")?.focus();
      }
    } catch (err) {
      alert((err as Error).message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /*
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true)
    try {
      if (isLogin) {
        const data = await loginUser(formData.email, formData.password);
        console.log(data);

        if (data?.message === "Login successful") {
          console.log("frontend(login.tsx) - login successful, checking user profile...");

          try {
            await fetchCurrentUserProfile(); // check if user profile exists
            console.log("✅ Profile found — redirecting to /jobs");
            navigate("/jobs");
          } catch (err: any) {
            if (err.message.includes("404") || err.message.toLowerCase().includes("profile not found")) {
              console.log("🆕 No profile found — redirecting to /user-profile");
              navigate("/user-profile"); // prompt user to fill profile
            } else {
              console.error("Unexpected error checking profile:", err);
              alert("An unexpected error occurred. Please try again.");
            }
          }

        } else {
          alert("Login failed. Please try again.");
        }
      } else {
        console.log("formData at submit:", formData);
        await registerUser(
          formData.email,
          formData.password,
          formData.username,
          formData.first_name,
          formData.last_name,
          formData.phone,
          formData.location,
        )
        alert("Registration successful! Please sign in.");
        setIsLogin(true);
        setFormData({
          email: "",
          password: "",
          username: "",
          first_name: "",
          last_name: "",
          phone: "",
          location: "",
        })
      }
    } catch (err) {
      alert((err as Error).message || "Login failed. Please try again.");
    }
  };
  */

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
              <>
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <div className="input-container">
                    <div className="input-icon">
                      <User className="icon" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required={!isLogin}
                      value={formData.username}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="johndoe"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="first_name" className="form-label">
                    First Name
                  </label>
                  <div className="input-container">
                    <div className="input-icon">
                      <User className="icon" />
                    </div>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      autoComplete="given-name"
                      required={!isLogin}
                      value={formData.first_name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="John"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="last_name" className="form-label">
                    Last Name
                  </label>
                  <div className="input-container">
                    <div className="input-icon">
                      <User className="icon" />
                    </div>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      autoComplete="family-name"
                      required={!isLogin}
                      value={formData.last_name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <div className="input-container">
                    <div className="input-icon">
                      <Phone className="icon" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required={!isLogin}
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <div className="input-container">
                    <div className="input-icon">
                      <MapPin className="icon" />
                    </div>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      autoComplete="address-level2"
                      required={!isLogin}
                      value={formData.location}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="New York, NY"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="input-container">
                <div className="input-icon">
                  <Mail className="icon" />
                </div>
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
                <div className="input-icon">
                  <Lock className="icon" />
                </div>
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
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
                  className="auth-link"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          )}

          <div className="form-submit">
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  <span className="button-icon">
                    <ArrowRight className="icon" aria-hidden="true" />
                  </span>
                  {isLogin ? "Sign in" : "Sign up"}
                </>
              )}
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

