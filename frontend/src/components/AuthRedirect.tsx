import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "src/components/auth"

const AuthRedirect = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const check = async () => {
      const result = await isAuthenticated();
      setAuthed(result);
      setAuthChecked(true);
    };
    check();
  }, []);

  if (!authChecked) return null; // or <Loading /> component

  return authed ? <Navigate to="/jobs" /> : <Navigate to="/login" />;
};

export default AuthRedirect;
