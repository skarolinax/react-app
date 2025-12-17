import { db } from './firebaseConfig.js';
import { collection, addDoc, setDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

// Function to add a to-do task to "tasks to do" collection
export async function addTaskToDo(title) {
  const id = uuidv4(); // generate a unique ID
    try {
      await setDoc(doc(db, "tasks to do", id), {
        title,
        done: false,
        timestamp: new Date()
      });
      console.log("Task added with ID: ", id);
      return id;
    } catch (e) {
      console.error("Error adding task to do: ", e);
    }
};

// Function to add a done task to "tasks done" collection

export async function addTaskToDone(id, title) {

    try {
      await setDoc(doc(db, "tasks done", id), {
        title,
        done: true,
        completedAt: new Date(),
      });
      console.log("Task with ID done ", id);
      return id;
    } catch (e) {
      console.error("Error adding done task: ", e);
    }
};

// Function to add a deleted task to "tasks deleted" collection
export async function addTaskToDeleted(id, title) {

    try {
      await setDoc(doc(db, "tasks deleted", id), {
        title,
        timestamp: new Date()
      });
      console.log("Task with ID moved to deleted ", id);
      return id;
    } catch (e) {
      console.error("Error adding deleted task: ", e);
    }
};


// Both functions for fetching tasks from Firestore and persisting them in state
export async function fetchTasksFromDb() {
  const tasksCol = collection(db, "tasks to do"); 
  const tasksSnapshot = await getDocs(tasksCol);  // fetch all docs
  const tasksList = tasksSnapshot.docs.map(doc => ({
    id: doc.id,            // Firestore ID, needed for updates/deletes
    title: doc.data().title
  }));
  return tasksList;
}

export async function fetchDoneTasksFromDb() {
  const doneTasksCol = collection(db, "tasks done"); // point to done collection
  const q = query(doneTasksCol, orderBy("completedAt", "asc")); // order by timestamp
  const tasksSnapshot = await getDocs(q); //pass the query
  const doneTasksList = tasksSnapshot.docs.map(doc => ({
    id: doc.id, // Firestore ID, needed for updates/deletes
    title: doc.data().title,
  }));
  return doneTasksList;
}

