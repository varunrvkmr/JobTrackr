export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const response = await fetch("http://localhost:5050/api/auth/check", {
      method: "GET",
      credentials: "include", // send cookie
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.authenticated === true;
  } catch (err) {
    return false;
  }
};