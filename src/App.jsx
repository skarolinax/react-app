import './styles/App.scss'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react'
import { useRef } from 'react';

function App() { 

  const [input, setInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const jsConfetti = new JSConfetti()

  function addTask() { 
    console.log('Adding task:', input);
    if (input.trim() === '') return; // prevent adding empty tasks
    setTasks([...tasks, input]);
    setInput(''); // clear input field after adding
  };

  function deleteTask(index) {
    console.log('Deleting task at index:', index);
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  }

  function markAsDone(index) {
    console.log('Marking task as done at index:', index);
    jsConfetti.addConfetti({emojis: ['🌈', '⚡️', '✨', '💫', '🌸'],});
    const taskMarkedDone = tasks[index];
    setDoneTasks([...doneTasks, taskMarkedDone]);
    deleteTask(index);
  }

  return (
      <div className="todo-app">
          <h1>Today's tasks</h1>
          <div id="todo-container">
            <div id="input-container">
              <input
                type="text"
                value={input}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTask();
                  }
                }}
                onChange={(e) => setInput(e.target.value)}
                id="todo-input" placeholder="Add a new task..." />
              <button id="add-button" onClick={addTask}>Add task</button>
            </div>
            <ul id="todo-list">
              {tasks.map((task, index) => (
                <li key={index}>{task}
                  <button onClick={() => deleteTask(index)} aria-label='Delete task' id='primary-btn'><i className="fa-solid fa-trash"></i></button>
                  <button onClick={() => markAsDone(index)}>Done</button>
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
