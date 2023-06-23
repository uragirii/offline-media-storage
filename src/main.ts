import "./style.css";
import { IDBPDatabase, openDB } from "idb";

const DB_VERSION = 1;
const DB_NAME = "offline-storage";
const STORE_NAME = "files";

const KEY_MAP = new Map<
  IDBValidKey,
  {
    url: string;
    size: string;
    name: string;
  }
>();

const button = document.getElementById("btn");
const app = document.getElementById("app");
const fileList = document.getElementById("file-list");
const fileSelector = document.getElementsByTagName("input")[0];
const usage = document.getElementById("usage");
const clearBtn = document.getElementById("clear");
const loadingFiles = document.getElementById("loading-files");

const bytesToReadable = (bytes: number) => {
  if (bytes < 1000) {
    return `${bytes}B`;
  }
  if (bytes < 1e6) {
    return `${(bytes / 1e3).toFixed(2)}KB`;
  }
  if (bytes < 1e9) {
    return `${(bytes / 1e6).toFixed(2)}MB`;
  }

  return `${(bytes / 1e9).toFixed(2)}GB`;
};

if (
  !button ||
  !app ||
  !fileList ||
  !fileSelector ||
  !usage ||
  !clearBtn ||
  !loadingFiles
) {
  throw new Error("Button not found");
}

let db: IDBPDatabase<unknown>;

(async () => {
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade: (database) => {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, {
          autoIncrement: true,
        });
      }
    },
  });

  // @ts-ignore
  button.disabled = false;
})();

const refreshUsage = async () => {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();

    if (estimate.quota && estimate.usage) {
      usage.innerText = `Used ${bytesToReadable(
        estimate.usage
      )} out of ${bytesToReadable(estimate.quota)} (${(
        (estimate.usage * 100) /
        estimate.quota
      ).toFixed(5)}%)`;
    } else {
      usage.innerText = `Couldn't calculate usage`;
    }
  } else {
    usage.innerHTML = `<code>navigator.storage.estimate</code> is not supported in your browser`;
  }
};

const refreshFilesList = async () => {
  const keys = await db.getAllKeys(STORE_NAME);

  if (loadingFiles?.textContent && keys.length === 0) {
    loadingFiles.textContent = "No files found";
  } else if (loadingFiles) {
    loadingFiles.textContent = "";
  }

  const newKeys = keys.filter((key) => !KEY_MAP.has(key));

  await Promise.all(
    newKeys.map(async (key) => {
      const data = await db.get(STORE_NAME, key);
      if (data instanceof File || data instanceof Blob) {
        const url = URL.createObjectURL(data);
        let fileName = "Unnamed File";
        const size = bytesToReadable(data.size);

        if (data instanceof File) {
          fileName = data.name;
        }
        KEY_MAP.set(key, {
          url,
          size,
          name: fileName,
        });

        const li = document.createElement("li");
        li.classList.add("file-item");
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.textContent = "Download File";
        const span = document.createElement("span");
        span.innerText = `${fileName} (${size})`;

        li.append(span, link);

        fileList.appendChild(li);
      }
    })
  );

  refreshUsage();
};

setInterval(async () => {
  // Check for new files inside IndexedDB
  if (!db) {
    return;
  }

  refreshFilesList();
}, 1500);

fileSelector.onchange = (e) => {
  // @ts-ignore
  const files: FileList = e.target?.files;

  for (let i = 0; i < files.length; ++i) {
    const file = files[i];
    db.add(STORE_NAME, file);
  }
};

button.onclick = () => {
  fileSelector.click();
};

clearBtn.onclick = () => {
  db.clear(STORE_NAME);
  KEY_MAP.forEach((_, key) => KEY_MAP.delete(key));
  fileList.replaceChildren(loadingFiles);
  refreshUsage();
  loadingFiles.textContent = "No files found";
};
