import { useState, useEffect } from "react";
import api from "./api";

/* -------------------------------------------------- */
/*  Main component                                    */
/* -------------------------------------------------- */
export default function Tasks({ onLogout }) {
  /* state */
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    deadline: "",
    importance: "2",
    difficulty: "3",
  });
  const [editId, setEditId] = useState(null);
  const [editTxt, setEditTxt] = useState("");

  /* load once */
  useEffect(() => {
    api.get("/api/tasks").then((r) => setTasks(r.data)).catch(console.error);
  }, []);

  /* helpers */
  const handleForm = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const addTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const { data } = await api.post("/api/tasks", form);
      setTasks([data, ...tasks]);
      setForm({ title: "", deadline: "", importance: "2", difficulty: "3" });
    } catch {
      alert("Failed to create task");
    }
  };

  const delTask = async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const toggleComplete = async (t) => {
    const newComp = t.completion === 100 ? 0 : 100;
    try {
      const { data } = await api.put(`/api/tasks/${t._id}`, {
        ...t,
        completion: newComp,
      });
      setTasks(tasks.map((task) => (task._id === data._id ? data : task)));
    } catch {
      alert("Update failed");
    }
  };

  const saveEdit = async (id) => {
    try {
      const { data } = await api.put(`/api/tasks/${id}`, { title: editTxt });
      setTasks(tasks.map((t) => (t._id === data._id ? data : t)));
      setEditId(null);
      setEditTxt("");
    } catch {
      alert("Edit failed");
    }
  };

  /* -------------------------------------------------- */
  return (
    <>
      {/* top bar */}
      <nav className="topbar">
        <span className="brand">TaskBoard</span>
        <button className="btn logout" onClick={onLogout}>
          Logout
        </button>
      </nav>

      {/* page content */}
      <main className="tasks-wrapper">
        <h1>Your Tasks</h1>

        {/* new-task form */}
        <form className="task-form" onSubmit={addTask}>
          <input
            placeholder="Task title"
            value={form.title}
            onChange={handleForm("title")}
          />
          <input
            type="datetime-local"
            value={form.deadline}
            onChange={handleForm("deadline")}
          />
          <select value={form.importance} onChange={handleForm("importance")}>
            <option value="4">High</option>
            <option value="2">Medium</option>
            <option value="1">Low</option>
          </select>
          <input
            type="number"
            min="1"
            max="5"
            value={form.difficulty}
            onChange={handleForm("difficulty")}
            placeholder="Diff"
          />
          <button className="btn" type="submit">
            Add
          </button>
        </form>

        {/* task list */}
        <ul className="task-grid">
          {tasks.map((t) => {
            /* --- helpers per task --- */
            const diffMs = t.deadline ? new Date(t.deadline) - new Date() : null;
            const overdue = diffMs !== null && diffMs < 0 && t.completion !== 100;

            let dueTxt = "";
            if (t.deadline) {
              if (overdue) dueTxt = "Overdue!";
              else {
                const d = Math.floor(diffMs / 86400000);
                const h = Math.floor((diffMs % 86400000) / 3600000);
                dueTxt = d === 0 && h === 0 ? "Due now"
                  : `Due in ${d ? d + "d " : ""}${h}h`;
              }
            }

            /* score → priority badge */
            let pri = "Low", badge = "badge low";
            if (t.score > 15) { pri = "High"; badge = "badge high"; }
            else if (t.score > 8) { pri = "Med"; badge = "badge med"; }

            return (
              <li key={t._id} className={`card ${overdue ? "overdue" : ""}`}>
                {/* complete toggle */}
                <input
                  type="checkbox"
                  checked={t.completion === 100}
                  onChange={() => toggleComplete(t)}
                />

                {/* title or edit */}
                {editId === t._id ? (
                  <input
                    value={editTxt}
                    onChange={(e) => setEditTxt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(t._id)}
                    onBlur={() => setEditId(null)}
                    autoFocus
                  />
                ) : (
                  <h2
                    onDoubleClick={() => {
                      setEditId(t._id);
                      setEditTxt(t.title);
                    }}
                    className={t.completion === 100 ? "strike" : ""}
                  >
                    {t.title}
                  </h2>
                )}

                {/* meta row */}
                <div className="meta">
                  <span className={badge}>{pri}</span>
                  {t.deadline && <span className="due">{dueTxt}</span>}
                </div>

                {/* delete */}
                <button className="del" onClick={() => delTask(t._id)}>
                  &times;
                </button>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
