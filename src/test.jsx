import { db } from './firebaseConfig.js';
import { collection, addDoc } from "firebase/firestore";

export async function addTaskToDo(title) {

    try {
      const docRef = await addDoc(collection(db, "tasks to do"), {
        title,
        done: false,
        timestamp: new Date()
      });
      console.log("Task added with ID: ", docRef.id);
      return docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
    }
};

export async function addTaskToDone(title) {

    try {
      const docRef = await addDoc(collection(db, "tasks done"), {
        title,
        done: true,
        timestamp: new Date()
      });
      console.log("Task with ID done ", docRef.id);
      return docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
    }
};

export async function addTaskToDeleted(title) {

    try {
      const docRef = await addDoc(collection(db, "tasks deleted"), {
        title,
        timestamp: new Date()
      });
      console.log("Task with ID deleted ", docRef.id);
      return docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
    }
};

export async function fetchTasksFromDb() {
  const tasksCol = collection(db, "tasks to do"); // point to your "to do" collection
  const tasksSnapshot = await getDocs(tasksCol);  // fetch all docs
  const tasksList = tasksSnapshot.docs.map(doc => ({
    id: doc.id,            // Firestore ID, needed for updates/deletes
    title: doc.data().title
  }));
  return tasksList;
}

