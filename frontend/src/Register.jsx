import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";

export default function Register({ onAuth }) {
  // form data
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  // error message
  const [err, setErr] = useState("");
  const nav = useNavigate();

  // submit registration
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
    <div className="auth">
      <h2>Register</h2>
      {err && <p className="error">{err}</p>}
      <form onSubmit={submit}>
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
