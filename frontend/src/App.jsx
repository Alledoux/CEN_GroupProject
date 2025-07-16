import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import Tasks from "./Tasks";
import api from "./api";
import "./App.css";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      /* set auth header and save token */
      api.defaults.headers.common["x-auth-token"] = token;
      localStorage.setItem("token", token);
    } else {
      /* clear auth header and storage */
      delete api.defaults.headers.common["x-auth-token"];
      localStorage.removeItem("token");
    }
  }, [token]);

  const logOut = () => setToken(null);

  return (
    <BrowserRouter>
      <div className="App-container">
        <Routes>
          <Route path="/login" element={<Login onAuth={setToken} />} />
          <Route path="/register" element={<Register onAuth={setToken} />} />
          <Route
            path="/"
            element={
              token
                ? <Tasks onLogout={logOut} />
                : <Navigate to="/login" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
