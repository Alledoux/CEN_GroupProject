const Agenda = require('agenda');
const sendEmail = require('../utils/sendEmail');
const Task = require('../models/Task');
const User = require('../models/Users');
require('dotenv').config();
const agenda = new Agenda({ db: { address: process.env.MONGO_URI } });

agenda.define('send task deadline notification', async (job) => {
  const { taskId } = job.attrs.data;
  const task = await Task.findById(taskId).populate('user');
  if (!task || task.notifiedBeforeDeadline) return;

  await sendEmail({
    to: task.user.email,
    subject: `Task Reminder: "${task.title}" is due soon!`,
    text: `Your task "${task.title}" is due at ${task.deadline}.`,
    html: `<p>Your task <strong>${task.title}</strong> is due at <strong>${task.deadline}</strong>.</p>`
  });

  task.notifiedBeforeDeadline = true;
  await task.save();
});

module.exports = agenda;