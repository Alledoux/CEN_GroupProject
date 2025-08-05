import React, { useState, useEffect } from 'react';

const EditTaskModal = ({ task, onUpdate, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        deadline: '',
        importance: '2',
        difficulty: '3',
        category: 'Personal', 
    });

    useEffect(() => {
        if (task) {
            let formattedDeadline = '';
            if (task.deadline) {
                const date = new Date(task.deadline);
                const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                formattedDeadline = localDate.toISOString().slice(0, 16);
            }

            setFormData({
                title: task.title || '',
                deadline: formattedDeadline,
                importance: String(task.importance) || '2',
                difficulty: String(task.difficulty) || '3',
                category: task.category || 'Personal', // Populate category
            });
        }
    }, [task]);

    if (!task) {
        return null;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(task._id, formData);
        onClose();
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Edit Task</h2>
                <form onSubmit={handleSubmit}>
                    <label>Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    
                    <label>Deadline</label>
                    <input type="datetime-local" name="deadline" value={formData.deadline} onChange={handleChange} />

                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
                        <option value="Personal">Personal</option>
                        <option value="Work">Work</option>
                        <option value="School">School</option>
                    </select>

                    <label>Importance</label>
                    <select name="importance" value={formData.importance} onChange={handleChange}>
                        <option value="4">High</option>
                        <option value="2">Medium</option>
                        <option value="1">Low</option>
                    </select>

                    <label>Difficulty (1-5)</label>
                    <input type="number" name="difficulty" min="1" max="5" value={formData.difficulty} onChange={handleChange} />
                    
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
