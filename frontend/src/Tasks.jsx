import { useState, useEffect } from "react";
import api from "./api";

export default function Tasks({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  /* load tasks once */
  useEffect(() => {
    api
      .get("/api/tasks")
      .then((res) => setTasks(res.data))
      .catch(console.error);
  }, []);

  /* create new task */
  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const { data } = await api.post("/api/tasks", { title });
      setTasks([data, ...tasks]);
      setTitle("");
    } catch (err) {
      console.error(err);
      alert("Create failed");
    }
  };

  /* delete a task */
  const remove = async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  /* toggle task completion between 0 and 100 */
  const toggle = async (task) => {
    const newComp = task.completion === 100 ? 0 : 100;
    try {
      const { data } = await api.put(`/api/tasks/${task._id}`, {
        ...task,
        completion: newComp,
      });
      setTasks(tasks.map((t) => (t._id === data._id ? data : t)));
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="tasks">
      <button onClick={onLogout}>Logout</button>
      <h2>Your Tasks</h2>

      <form onSubmit={add}>
        <input
          placeholder="New task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((t) => (
          <li
            key={t._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            {/* completion checkbox */}
            <input
              type="checkbox"
              checked={t.completion === 100}
              onChange={() => toggle(t)}
            />

            {/* task title */}
            <span
              style={{
                flexGrow: 1,
                textDecoration: t.completion === 100 ? "line-through" : "none",
                opacity: t.completion === 100 ? 0.6 : 1,
              }}
            >
              {t.title}
            </span>

            {/* delete button */}
            <button
              onClick={() => remove(t._id)}
              aria-label="Delete task"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "1.2rem",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
);
}


//GitHub testing to see if terminal works
