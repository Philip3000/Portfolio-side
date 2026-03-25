const firebaseConfig = {
  apiKey: "AIzaSyB6TDOY2ptExW-mz37VNsdg8eviXwIn-xI",
  authDomain: "pportfolio-a76a4.firebaseapp.com",
  projectId: "pportfolio-a76a4",
  storageBucket: "pportfolio-a76a4.appspot.com",
  messagingSenderId: "175686223810",
  appId: "1:175686223810:web:24d82fdccc7b2d2238b85b",
  measurementId: "G-JYBLL96L2D"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

const COLLECTION_CONFIG = {
  portfolio: {
    label: "Portfolio Item",
    fields: ["title", "description", "link", "code"]
  },
  about: {
    label: "About Item",
    fields: ["title", "description"]
  },
  skills: {
    label: "Skill",
    fields: ["name"]
  },
  interests: {
    label: "Interest",
    fields: ["name"]
  },
  knowledgebase: {
    label: "Knowledgebase Item",
    fields: ["name", "link"]
  },
  relations: {
    label: "Relation",
    fields: ["name", "link", "path"]
  }
};

const loginForm = document.getElementById("login-form");
const loginCard = document.getElementById("login-card");
const adminContent = document.getElementById("admin-content");
const logoutBtn = document.getElementById("logout-btn");
const alertContainer = document.getElementById("alert-container");
const resumeUploadBtn = document.getElementById("upload-resume");
const resumeFileInput = document.getElementById("resume-upload");
const resumeStatus = document.getElementById("resume-status");

function showMessage(message, type = "success") {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function formatLabel(key) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function setAuthenticatedUI(isAuthenticated) {
  loginCard.classList.toggle("d-none", isAuthenticated);
  adminContent.classList.toggle("d-none", !isAuthenticated);
  logoutBtn.classList.toggle("d-none", !isAuthenticated);
}

async function loadAllCollections() {
  const collections = Object.keys(COLLECTION_CONFIG);
  for (const collection of collections) {
    await loadCollection(collection);
  }
}

async function loadCollection(collection) {
  try {
    const snapshot = await db.collection(collection).get();
    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data()
    }));
    renderCollectionList(collection, docs);
  } catch (error) {
    console.error(`Error loading ${collection}:`, error);
    showMessage(`Could not load ${collection}: ${error.message}`, "danger");
  }
}

function renderCollectionList(collection, docs) {
  const container = document.getElementById(`${collection}-list`);
  container.innerHTML = "";

  if (!docs.length) {
    container.innerHTML = `<div class="text-muted">No ${collection} items yet.</div>`;
    return;
  }

  docs.forEach(({ id, data }) => {
    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const title = document.createElement("h5");
    title.className = "card-title";
    title.textContent = data.title || data.name || "Untitled item";
    cardBody.appendChild(title);

    Object.entries(data).forEach(([key, value]) => {
      if (!value || key === "title" || key === "name") return;

      const wrapper = document.createElement("div");
      wrapper.className = "mb-2";

      const label = document.createElement("strong");
      label.textContent = `${formatLabel(key)}: `;
      wrapper.appendChild(label);

      const isUrlField = key === "link" || key === "code";
      const isRelationImage = collection === "relations" && key === "path";

      if (isUrlField || isRelationImage) {
        const link = document.createElement("a");
        link.href = value;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = value;
        wrapper.appendChild(link);

        if (isRelationImage) {
          const img = document.createElement("img");
          img.src = value;
          img.alt = data.name || "Relation image";
          img.className = "thumb-preview d-block";
          wrapper.appendChild(img);
        }
      } else if (key === "description") {
        const p = document.createElement("p");
        p.className = "mb-0 mt-1";
        p.textContent = value;
        wrapper.appendChild(p);
      } else {
        const span = document.createElement("span");
        span.textContent = value;
        wrapper.appendChild(span);
      }

      cardBody.appendChild(wrapper);
    });

    const buttonRow = document.createElement("div");
    buttonRow.className = "d-flex gap-2 mt-3";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-outline-primary btn-sm";
    editBtn.dataset.action = "edit";
    editBtn.dataset.collection = collection;
    editBtn.dataset.id = id;
    editBtn.innerHTML = `<i class="bi bi-pencil"></i> Edit`;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-outline-danger btn-sm";
    deleteBtn.dataset.action = "delete";
    deleteBtn.dataset.collection = collection;
    deleteBtn.dataset.id = id;
    deleteBtn.innerHTML = `<i class="bi bi-trash"></i> Delete`;

    buttonRow.appendChild(editBtn);
    buttonRow.appendChild(deleteBtn);
    cardBody.appendChild(buttonRow);
    card.appendChild(cardBody);
    container.appendChild(card);
  });
}

function getPayloadFromForm(form, collection) {
  const payload = {};
  const fields = COLLECTION_CONFIG[collection].fields;

  fields.forEach((field) => {
    payload[field] = (form.elements[field]?.value || "").trim();
  });

  return payload;
}

function resetForm(form) {
  form.reset();
  form.elements.docId.value = "";

  const collection = form.dataset.collection;
  const submitBtn = form.querySelector(".submit-btn");
  const cancelBtn = form.querySelector(".cancel-edit");

  submitBtn.textContent = `Add ${COLLECTION_CONFIG[collection].label}`;
  cancelBtn.classList.add("d-none");
}

function populateForm(form, data, docId) {
  const collection = form.dataset.collection;

  form.elements.docId.value = docId;

  COLLECTION_CONFIG[collection].fields.forEach((field) => {
    if (form.elements[field]) {
      form.elements[field].value = data[field] || "";
    }
  });

  form.querySelector(".submit-btn").textContent = `Update ${COLLECTION_CONFIG[collection].label}`;
  form.querySelector(".cancel-edit").classList.remove("d-none");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const collection = form.dataset.collection;
  const docId = form.elements.docId.value.trim();
  const payload = getPayloadFromForm(form, collection);

  try {
    if (docId) {
      await db.collection(collection).doc(docId).set(payload, { merge: true });
      showMessage(`${COLLECTION_CONFIG[collection].label} updated successfully.`);
    } else {
      await db.collection(collection).add(payload);
      showMessage(`${COLLECTION_CONFIG[collection].label} added successfully.`);
    }

    resetForm(form);
    await loadCollection(collection);
  } catch (error) {
    console.error(`Error saving ${collection}:`, error);
    showMessage(`Could not save ${collection}: ${error.message}`, "danger");
  }
}

async function handleListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, collection, id } = button.dataset;

  if (action === "delete") {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    try {
      await db.collection(collection).doc(id).delete();
      showMessage(`${COLLECTION_CONFIG[collection].label} deleted successfully.`);
      await loadCollection(collection);
    } catch (error) {
      console.error(`Error deleting ${collection}:`, error);
      showMessage(`Could not delete ${collection}: ${error.message}`, "danger");
    }
  }

  if (action === "edit") {
    try {
      const doc = await db.collection(collection).doc(id).get();
      if (!doc.exists) {
        showMessage("Item not found.", "warning");
        return;
      }

      const form = document.querySelector(`.collection-form[data-collection="${collection}"]`);
      populateForm(form, doc.data(), doc.id);
    } catch (error) {
      console.error(`Error loading ${collection} item:`, error);
      showMessage(`Could not load item for editing: ${error.message}`, "danger");
    }
  }
}

async function uploadResume() {
  const file = resumeFileInput.files[0];

  if (!file) {
    showMessage("Select a PDF before uploading.", "warning");
    return;
  }

  if (file.type !== "application/pdf") {
    showMessage("Resume must be a PDF file.", "warning");
    return;
  }

  try {
    resumeUploadBtn.disabled = true;
    resumeStatus.textContent = "Uploading...";

    const storageRef = storage.ref("resume.pdf");
    await storageRef.put(file);

    resumeStatus.textContent = "Upload complete.";
    showMessage("Resume uploaded successfully.");
    resumeFileInput.value = "";
  } catch (error) {
    console.error("Error uploading resume:", error);
    resumeStatus.textContent = "";
    showMessage(`Error uploading resume: ${error.message}`, "danger");
  } finally {
    resumeUploadBtn.disabled = false;
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    showMessage("Login successful.");
  } catch (error) {
    console.error("Error signing in:", error);
    showMessage(`Error signing in: ${error.message}`, "danger");
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await auth.signOut();
    showMessage("Logged out.");
  } catch (error) {
    console.error("Error signing out:", error);
    showMessage(`Error signing out: ${error.message}`, "danger");
  }
});

resumeUploadBtn.addEventListener("click", uploadResume);

document.querySelectorAll(".collection-form").forEach((form) => {
  form.addEventListener("submit", handleFormSubmit);

  const cancelBtn = form.querySelector(".cancel-edit");
  cancelBtn.addEventListener("click", () => resetForm(form));
});

document.querySelectorAll(".collection-list").forEach((list) => {
  list.addEventListener("click", handleListClick);
});

auth.onAuthStateChanged(async (user) => {
  setAuthenticatedUI(!!user);

  if (user) {
    await loadAllCollections();
  }
});