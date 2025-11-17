import './styles/App.scss'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { use, useEffect, useState } from 'react'
import Modal from './Modal.jsx';

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

import { addTaskToDo, addTaskToDone, addTaskToDeleted, fetchTasksFromDb } from './test';

function App() { 

  const [input, setInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showMessage, setShowMessage] = useState(true);

  const jsConfetti = new JSConfetti()

  useEffect(() => {
    async function loadTasks() {
      const tasksFromDb = await fetchTasksFromDb();
      setTasks(tasksFromDb);
    }
    loadTasks();
  }, []);

  useEffect(() => {
    if (tasks.length === 0 && doneTasks.length > 0) { // Show modal when all tasks are done (and there was at least one task done)
      setShowModal(true);
      const timer = setTimeout(() => setShowModal(false), 3000);
      return () => clearTimeout(timer);
    }}, [tasks, doneTasks]);

  useEffect(() => {
    if (tasks.length === 0) {
      setShowMessage(true)
    } else {
      setShowMessage(false);
    }}, [tasks]);

  async function addTask() { 
    console.log('Adding task:', input);
    if (input.trim() === '') return; // prevent adding empty tasks

    const docId = await addTaskToDo(input); // Firebase returns ID
    setTasks([...tasks, { id: docId, title: input }]);

    setInput(''); // clear input field after adding
  };

  async function deleteTask(index) {
    const taskToDelete = tasks[index];
    console.log('Deleting task at index:', index, 'Task:', taskToDelete.title);
    
    await addTaskToDeleted(taskToDelete.title); // Add to deleted collection in Firebase
    await deleteDoc(doc(db, "tasks to do", taskToDelete.id)); // Delete from Firebase

    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  }

  async function markAsDone(index) {
    console.log('Marking task as done at index:', index);
    jsConfetti.addConfetti({emojis: ['🌈', '⚡️', '✨', '💫', '🌸'],}); //Load confetti package 
    const task = tasks[index];

    await addTaskToDone(task.title); // Add to done collection in Firebase
    await deleteDoc(doc(db, "tasks to do", task.id)); // Remove from to do collection in Firebase

    setDoneTasks([...doneTasks, task.title]);
    setTasks(tasks.filter((_, i) => i !== index));
  }

  return (
      <div className="todo-app">
          <h1>Today's tasks</h1>

          {showModal ? <Modal /> : null} 

          <div id="todo-container">
            <div id="input-container">
              <input
                type="text"
                value={input}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { //Allow on enter input
                    addTask();
                  }
                }}
                onChange={(e) => setInput(e.target.value)}
                id="todo-input" placeholder="Add a new task..." />
              <button id="add-button" onClick={addTask}>Add task</button>
            </div>

            {showMessage ? <h3>So empty.. add new tasks now!</h3> : null}
            <ul id="todo-list">

              {tasks.map((task, index) => (
                <li key={task.id}>
                  <label>
                    <span className="custom-checkbox"></span>
                    <input 
                      type="checkbox"
                      onChange={() => markAsDone(index)}
                      aria-label={`Mark task ${task.title} as done`}/>
                    <p>{task.title}</p>
                  </label>
                  <button onClick={() => deleteTask(index)} aria-label='Delete task' id='primary-btn'>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div id="done-container">
            <h2>Done</h2>
            <ul id="done-list">
              {doneTasks.map((taskMarkedDone, index) => (
                <li key={index}>{taskMarkedDone}</li>
              ))}
            </ul>
          </div>

        </div>      

  )
}

export default App
