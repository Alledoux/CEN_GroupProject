import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";

export default function Login({ onAuth }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr]   = useState("");
  const nav = useNavigate();

  const handle = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/api/auth/login", form);
      localStorage.setItem("token", data.token);
      onAuth(data.token);
      nav("/");
    } catch (e) {
      setErr(e.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="center-page">
      <div className="auth">
        <h2>Welcome back</h2>

        {err && <p className="error">{err}</p>}

        <form onSubmit={submit}>
          <input type="email"    placeholder="Email"    value={form.email}    onChange={handle("email")} />
          <input type="password" placeholder="Password" value={form.password} onChange={handle("password")} />
          <button type="submit">Log in</button>
        </form>

        <p>Don’t have an account? <Link to="/register">Create one →</Link></p>
      </div>
    </div>
  );
}
