import { useState, useEffect } from "react";
import api from "./api";

export default function Tasks({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [importance, setImportance] = useState("2");
  const [difficulty, setDifficulty] = useState("3");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskText, setEditTaskText] = useState("");


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
      const { data } = await api.post("/api/tasks", { title, deadline, importance, difficulty });
      setTasks([data, ...tasks]);
      setTitle("");
      setDeadline("");
      setImportance("2");
      setDifficulty("3");
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

  const handleUpdateTask = async (id) => {
    try {
      const { data } = await api.put(`/api/tasks/${id}`, {
        title: editTaskText,
      });
      const updated = tasks.map((t) => (t._id === data._id ? data : t));
      setTasks(updated);
      setEditTaskId(null);
      setEditTaskText("");
    } catch (err) {
      console.error(err);
      alert("Failed to update task.");
    }
  };

  return (
    <div className="tasks">
      <button onClick={onLogout}>Logout</button>
      <h2>Your Tasks</h2>

      <form onSubmit={add} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          placeholder="New task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <select value={importance} onChange={(e) => setImportance(e.target.value)}>
          <option value="4">High Importance</option>
          <option value="2">Medium Importance</option>
          <option value="1">Low Importance</option>
        </select>
        <input
          type="number"
          placeholder="Difficulty (1-5)"
          min="1"
          max="5"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((t) => {
          const diffMs = t.deadline ? new Date(t.deadline) - new Date() : null;
          const isOverdue = diffMs !== null && diffMs < 0 && t.completion !== 100;

          let dueText = "";
          if (t.deadline) {
            if (isOverdue) {
              dueText = "Overdue!";
            } else {
              const days = Math.floor(diffMs / 86400000);
              const hours = Math.floor((diffMs % 86400000) / 3600000);
              if (days === 0 && hours === 0) {
                dueText = "Due now";
              } else if (days === 0) {
                dueText = `Due in ${hours}h`;
              } else {
                dueText = `Due in ${days}d ${hours}h`;
              }
            }
          }

          let priorityLabel = "Low";
          let priorityColor = "green";
          if (t.score > 15) {
            priorityLabel = "High";
            priorityColor = "red";
          } else if (t.score > 8) {
            priorityLabel = "Medium";
            priorityColor = "orange";
          }

          return (
            <li
              key={t._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
                color: isOverdue ? "#f55" : undefined,
              }}
            >
              {/* completion checkbox */}
              <input
                type="checkbox"
                checked={t.completion === 100}
                onChange={() => toggle(t)}
              />

              {/* task title */}
              {editTaskId === t._id ? (
                <input
                  type="text"
                  value={editTaskText}
                  onChange={(e) => setEditTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateTask(t._id);
                  }}
                  onBlur={() => setEditTaskId(null)}
                  style={{
                    flexGrow: 1,
                    padding: "4px 8px",
                    fontSize: "1rem",
                  }}
                  autoFocus
                />
              ) : (
                <span
                  onDoubleClick={() => {
                    setEditTaskId(t._id);
                    setEditTaskText(t.title);
                  }}
                  style={{
                    flexGrow: 1,
                    textDecoration:
                      t.completion === 100 ? "line-through" : "none",
                    opacity: t.completion === 100 ? 0.6 : 1,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  {t.title}
                </span>
              )}

              {/* NEW: Priority Label */}
              <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: priorityColor }}>
                ({priorityLabel})
              </span>

              {/* due date display */}
              {t.deadline && (
                <span style={{ fontSize: "0.85rem" }}>{dueText}</span>
              )}

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
          );
        })}
      </ul>
    </div>
  );
}
