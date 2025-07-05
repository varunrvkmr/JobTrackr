"use client"

import type React from "react"
import Sidebar from "./Sidebar"

interface LayoutWrapperProps {
  children: React.ReactNode
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "fixed", // Ensure it takes full viewport
        top: 0,
        left: 0,
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
          height: "100vh", // Explicit height
        }}
      >
        <div
          style={{
            flex: 1,
            overflow: "auto", // Allow scrolling within this container
            height: "100%",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default LayoutWrapper
