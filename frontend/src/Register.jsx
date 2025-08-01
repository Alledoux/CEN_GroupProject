import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";

export default function Register({ onAuth }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [err, setErr]   = useState("");
  const nav = useNavigate();

  const handle = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/api/auth/register", form);
      onAuth(data.token);
      nav("/");
    } catch (e) {
      setErr(e.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="center-page">
      <div className="auth">
        <h2>Create account</h2>

        {err && <p className="error">{err}</p>}

        <form onSubmit={submit}>
          <input placeholder="Username" value={form.username} onChange={handle("username")} />
          <input type="email" placeholder="Email" value={form.email} onChange={handle("email")} />
          <input type="password" placeholder="Password" value={form.password} onChange={handle("password")} />
          <button type="submit">Sign up</button>
        </form>

        <p>Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
