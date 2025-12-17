import './styles/App.scss'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { use, useEffect, useState } from 'react'
import Modal from './Modal.jsx';

import { collection, addDoc, getDocs, doc, updateDoc, onSnapshot, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

import { addTaskToDo, addTaskToDone, addTaskToDeleted, fetchTasksFromDb, fetchDoneTasksFromDb } from './test';

function App() { 

  const [input, setInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showMessage, setShowMessage] = useState(true);

  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const jsConfetti = new JSConfetti()

  //Fetch tasks from Firestore to display on load
  useEffect(() => {
    const q = query(collection(db, "tasks to do"), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, snapshot => {
      setTasks(
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => unsubscribe();
  }, []);

  //Fetch done tasks from Firestore to display on load
  useEffect(() => {
    async function loadDoneTasks() {
      const doneTasksFromDb = await fetchDoneTasksFromDb();
      setDoneTasks(doneTasksFromDb);
    }
    loadDoneTasks();
  }, []);

  useEffect(() => {
    if (tasks.length === 0 && doneTasks.length > 0) { // Show modal when all tasks are done
      setShowModal(true);
      const timer = setTimeout(() => setShowModal(false), 2000);
      return () => clearTimeout(timer);
    }}, [tasks]);

  useEffect(() => {
    if (tasks.length === 0) {
      setShowMessage(true)
    } else {
      setShowMessage(false);
    }}, [tasks]);

  async function addTask(title = input) { 
    console.log('Adding task:', input);
    if (input.trim() === '') return; // prevent adding empty tasks

    const docId = await addTaskToDo(input); // Firebase returns ID
    setTasks([...tasks, { id: docId, title: input }]);

    setInput(''); // clear input field after adding
  };

  async function deleteTask(index) {
    const task = tasks[index];
    console.log('Deleting task at index:', index, 'Task:', task.title);
    
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);

    await addTaskToDeleted(task.id, task.title); // Add to deleted collection in Firebase
    await deleteDoc(doc(db, "tasks to do", task.id)); // Delete from Firebase
  }

  async function markAsDone(index) {
    jsConfetti.addConfetti({ emojis: ['🌈', '⚡️', '✨'] });

    const task = tasks[index];

    setDoneTasks(prev => [...prev, { ...task, doneAt: Date.now() }]);
    setTasks(prev => prev.filter((_, i) => i !== index));

    await addTaskToDone(task.id, task.title);
    await deleteDoc(doc(db, "tasks to do", task.id));

    // Fetch AI suggestions based on recent done tasks
    const recentTasks = [...doneTasks, task]
      .slice(-5)
      .map(t => t.title);

    try {
      setLoadingSuggestions(true);

      const res = await fetch("http://localhost:3001/api/getAISuggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recentTasks })
      });


      const data = await res.json();
      setAiSuggestions(data.suggestions);

    } catch (err) {
      console.error("AI suggestion error:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  // Auto remove the done list after midnight
  // useEffect(() => {
  //   if (doneTasks.length === 0) return;

  //   const interval = setInterval(() => {
  //     const now = Date.now();
  //     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  //     setDoneTasks(prev => {
  //       const stillValid = prev.filter(task => task.doneAt >= today );
  //       const expiredDoneTask = prev.filter(task => task.doneAt < today);
  //       expiredDoneTask.forEach(async task => {
  //         await deleteDoc(doc(db, "tasks done", task.id)); // Remove from Firebase
  //       });
  //        return stillValid;});
  //     }, 100); // Check every 100ms
  //     return () => {
  //       clearInterval(interval)
  //     }
  //   }, [doneTasks.length]);

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

            {aiSuggestions.length > 0 && (
              <div id="ai-suggestions">
                <h3>Suggested tasks</h3>

                {loadingSuggestions && <p>Thinking… 🤔</p>}

                <ul>
                  {aiSuggestions.map((task, index) => (
                    <li key={index}>
                      {task}
                      <button onClick={() => addTask(task)}>Add</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
              {doneTasks.map(task => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </div>

        </div>      

  )
}

export default App
