import React, { useState, useEffect } from 'react';

const EditTaskModal = ({ task, onUpdate, onClose }) => {
    // This state holds the form data while the user is editing.
    const [formData, setFormData] = useState({
        title: '',
        deadline: '',
        importance: '2',
        difficulty: '3',
    });

    
    useEffect(() => {
        if (task) {
            let formattedDeadline = '';
            if (task.deadline) {
                // Create a date object from the deadline string
                const date = new Date(task.deadline);
                // Create a new date object that accounts for the timezone offset
                const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                // Convert to ISO string and slice to the correct format for the input
                formattedDeadline = localDate.toISOString().slice(0, 16);
                
            }

            setFormData({
                title: task.title || '',
                deadline: formattedDeadline,
                importance: String(task.importance) || '2',
                difficulty: String(task.difficulty) || '3',
            });
        }
    }, [task]);

    // If no task is being edited, the modal doesn't show up.
    if (!task) {
        return null;
    }

    // Updates the form state as the user types.
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Called when the user clicks "Save Changes".
    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(task._id, formData); // Sends the updated data back to Tasks.jsx
        onClose(); // Closes the modal
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Edit Task</h2>
                <form onSubmit={handleSubmit}>
                    <label>Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                    <label>Deadline</label>
                    <input
                        type="datetime-local"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                    />
                    <label>Importance</label>
                    <select name="importance" value={formData.importance} onChange={handleChange}>
                        <option value="4">High</option>
                        <option value="2">Medium</option>
                        <option value="1">Low</option>
                    </select>
                    <label>Difficulty (1-5)</label>
                    <input
                        type="number"
                        name="difficulty"
                        min="1"
                        max="5"
                        value={formData.difficulty}
                        onChange={handleChange}
                    />
                    <div className="modal-actions">
                        <button type="button" className="btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTaskModal;
