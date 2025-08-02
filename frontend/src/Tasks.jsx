import { useState, useEffect } from "react";
import api from "./api";
import EditTaskModal from "./EditTaskModal";

// react-big-calendar setup 
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);
const allowedViews = ["month", "week", "day", "agenda"]; 

export default function Tasks({ onLogout }) {
  const [tasks, setTasks] = useState([]);

  /* form for adding new tasks (list view) */
  const [form, setForm] = useState({
    title: "",
    deadline: "",
    importance: "2",
    difficulty: "3",
  });

  /* editing modal */
  const [editingTask, setEditingTask] = useState(null);

  
  const [viewMode, setViewMode] = useState("list");

  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");

  useEffect(() => {
    api
      .get("/api/tasks")
      .then((r) => setTasks(r.data))
      .catch(console.error);
  }, []);

  const handleForm = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const addTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const { data } = await api.post("/api/tasks", form);
      setTasks([...tasks, data].sort((a, b) => b.score - a.score));
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
        completion: newComp,
      });
      const newTasks = tasks.map((task) => (task._id === data._id ? data : task));
      setTasks(newTasks.sort((a, b) => b.score - a.score));
    } catch {
      alert("Update failed");
    }
  };

  const handleUpdateTask = async (id, updatedData) => {
    try {
      const { data } = await api.put(`/api/tasks/${id}`, updatedData);
      const newTasks = tasks.map((t) => (t._id === data._id ? data : t));
      setTasks(newTasks.sort((a, b) => b.score - a.score));
      setEditingTask(null);
    } catch {
      alert("Edit failed");
    }
  };

  /* transform tasks → calendar events */
  const getCalendarEvents = () =>
    tasks
      .filter((task) => task.deadline)
      .map((task) => ({
        id: task._id,
        title: task.title,
        start: new Date(task.deadline),
        end: new Date(task.deadline),
      }));

  
  return (
    <>
      <nav className="topbar">
        <span className="brand">TaskBoard</span>
        <button className="btn logout" onClick={onLogout}>
          Logout
        </button>
      </nav>

      <main className="tasks-wrapper">
        <h1>Your Tasks</h1>

        {/* List ⇄ Calendar toggle */}
        <div className="view-toggle">
          <button
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "active" : ""}
          >
            List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={viewMode === "calendar" ? "active" : ""}
          >
            Calendar
          </button>
        </div>

        {/*  LIST VIEW  */}
        {viewMode === "list" && (
          <>
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
              <select
                value={form.importance}
                onChange={handleForm("importance")}
              >
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

            <ul className="task-grid">
              {tasks.map((t) => {
                const diffMs = t.deadline
                  ? new Date(t.deadline) - new Date()
                  : null;
                const overdue = diffMs !== null && diffMs < 0 && t.completion !== 100;
                let dueTxt = "";
                if (t.deadline) {
                  if (overdue) dueTxt = "Overdue!";
                  else {
                    const d = Math.floor(diffMs / 86400000);
                    const h = Math.floor((diffMs % 86400000) / 3600000);
                    dueTxt = d === 0 && h === 0 ? "Due now" : `Due in ${d ? d + "d " : ""}${h}h`;
                  }
                }
                let pri = "Low",
                  badge = "badge low";
                if (t.score > 15) {
                  pri = "High";
                  badge = "badge high";
                } else if (t.score > 8) {
                  pri = "Med";
                  badge = "badge med";
                }

                return (
                  <li key={t._id} className={`card ${overdue ? "overdue" : ""}`}>
                    <input
                      type="checkbox"
                      checked={t.completion === 100}
                      onChange={() => toggleComplete(t)}
                    />
                    <h2 className={t.completion === 100 ? "strike" : ""}>
                      {t.title}
                    </h2>
                    <div className="meta">
                      <span className={badge}>{pri}</span>
                      {t.deadline && <span className="due">{dueTxt}</span>}
                    </div>
                    <button
                      className="edit"
                      onClick={() => setEditingTask(t)}
                    >
                      &#9998;
                    </button>
                    <button
                      className="del"
                      onClick={() => delTask(t._id)}
                    >
                      &times;
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* CALENDAR VIEW */}
        {viewMode === "calendar" && (
          <div className="calendar-container">
            <Calendar
              localizer={localizer}
              events={getCalendarEvents()}
              startAccessor="start"
              endAccessor="end"
              /* controlled navigation / view */
              date={currentDate}
              onNavigate={setCurrentDate}
              view={currentView}
              onView={setCurrentView}
              views={allowedViews}
              style={{ height: "70vh" }}
              onSelectEvent={(event) =>
                setEditingTask(tasks.find((t) => t._id === event.id))
              }
            />
          </div>
        )}
      </main>

      {/* edit-task modal */}
      <EditTaskModal
        task={editingTask}
        onUpdate={handleUpdateTask}
        onClose={() => setEditingTask(null)}
      />
    </>
  );
}


//updated code as of now 7:34 pm 8/2/25