import './styles/App.scss'
import { useState } from 'react'

function App() { 

  const [input, setInput] = useState('');
  const [tasks, setTasks] = useState([]);

  function addTask() { 
    if (input.trim() === '') return; // prevent adding empty tasks
    setTasks([...tasks, input]);
    setInput(''); // clear input field after adding
  }
  
  return (
    <div className="todo-app">
      <h1>To Do App</h1>

      <div id="todo-container">
        <div id="input-container">
          <input 
            type="text" 
            value={input}   
            onChange={(e) => setInput(e.target.value)}  // update state on typing
            id="todo-input" placeholder="Add a new task..." />
          <button id="add-button" onClick={addTask}>Add task</button>
        </div>

        <ul id="todo-list">
          {tasks.map((task, index) => (
            <li key={index}>{task}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
