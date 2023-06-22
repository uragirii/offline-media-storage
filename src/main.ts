import "./style.css";
import { openDB } from "idb";

const DB_VERSION = 1;

const button = document.getElementById("btn");
const app = document.getElementById("app");

if (!button || !app) {
  throw new Error("Button not found");
}

button.onclick = async () => {
  const db = await openDB("test-db1", DB_VERSION, {
    upgrade: (database) => {
      if (!database.objectStoreNames.contains("test-store1")) {
        database.createObjectStore("test-store1", {
          autoIncrement: true,
        });
      }
    },
  });
  // db.add("test-store1", "Some Value");
  // const res = await fetch(
  //   "https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
  // );
  // const blob = await res.blob();

  // console.log(blob);

  // db.add("test-store1", blob);

  const imageBlob = await db.get("test-store1", 3);
  console.log(imageBlob);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(imageBlob);
  link.download = "image.jpeg";
  link.textContent = "Download Image";

  app.appendChild(link);
};
