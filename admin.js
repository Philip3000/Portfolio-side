// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB6TDOY2ptExW-mz37VNsdg8eviXwIn-xI",
    authDomain: "pportfolio-a76a4.firebaseapp.com",
    projectId: "pportfolio-a76a4",
    storageBucket: "pportfolio-a76a4.appspot.com",
    messagingSenderId: "175686223810",
    appId: "1:175686223810:web:24d82fdccc7b2d2238b85b",
    measurementId: "G-JYBLL96L2D"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();
  
  document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Login form submitted");
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    console.log("Email:", email);
    console.log("Password:", password);
    
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log("Sign in successful");
        document.getElementById("login-form").style.display = "none";
        document.getElementById("admin-content").style.display = "block";
        loadAdminContent(); // Load admin content on successful login
      })
      .catch(error => {
        console.error("Error signing in:", error.message);
        alert("Error signing in: " + error.message); // Display error to the user
      });
  });
  
  document.getElementById("upload-resume").addEventListener("click", function () {
    const file = document.getElementById("resume-upload").files[0];
    const storageRef = storage.ref('resume.pdf');
    storageRef.put(file).then(() => {
      alert("Resume uploaded successfully!");
    }).catch(error => {
      console.error("Error uploading resume:", error.message);
      alert("Error uploading resume: " + error.message);
    });
  });
  document.getElementById("upload-image").addEventListener("click", function () {
    const file = document.getElementById("image-upload").files[0];
    const storageRef = storage.ref();
    storageRef.put(file).then(() => {
      alert("Image uploaded successfully!");
    }).catch(error => {
      console.error("Error uploading Image:", error.message);
      alert("Error uploading Image: " + error.message);
    });
  });
  document.getElementById("add-portfolio").addEventListener("click", function () {
    const title = prompt("Enter portfolio item title:");
    const description = prompt("Enter portfolio item description:");
    const link = prompt("Enter portfolio item link:");
    const code = prompt("Enter github link:")
    db.collection("portfolio").add({
      title: title,
      description: description,
      link: link,
      code: code
    }).then(() => {
      alert("Portfolio item added successfully!");
      loadAdminContent(); // Refresh the portfolio list
    }).catch(error => {
      console.error("Error adding portfolio item:", error.message);
      alert("Error adding portfolio item: " + error.message);
    });
  });
  
  // Fetch and display data
  function fetchAndDisplayData(collection, elementId) {
    db.collection(collection).get().then(querySnapshot => {
      const list = document.getElementById(elementId);
      list.innerHTML = "";
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");
        div.className = "card mb-2";
        div.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">${data.title || data.name}</h5>
            <p class="card-text">${data.description || ''}</p>
            <button class="btn btn-danger" onclick="deleteItem('${collection}', '${doc.id}')">Delete</button>
          </div>
        `;
        list.appendChild(div);
      });
    }).catch(error => {
      console.error("Error fetching data:", error.message);
      alert("Error fetching data: " + error.message);
    });
  }
  
  function deleteItem(collection, id) {
    db.collection(collection).doc(id).delete().then(() => {
      alert("Item deleted successfully!");
      fetchAndDisplayData(collection, `${collection}-list`);
    }).catch(error => {
      console.error("Error deleting item:", error.message);
      alert("Error deleting item: " + error.message);
    });
  }
  
  
  document.getElementById("add-about").addEventListener("click", function () {
    const title = prompt("Enter about title:");
    const description = prompt("Enter about me item description:");
    db.collection("about").add({
      title: title,
      description: description,
    }).then(() => {
      alert("About item added successfully!");
      loadAdminContent(); // Refresh the portfolio list
    }).catch(error => {
      console.error("Error adding About item:", error.message);
      alert("Error adding about item: " + error.message);
    });
  });
  document.getElementById("add-skill").addEventListener("click", function () {
    const skill = prompt("Enter skill:");
    db.collection("skills").add({
      name: skill
    }).then(() => {
      alert("Skill added successfully!");
      loadAdminContent(); // Refresh the skills list
    }).catch(error => {
      console.error("Error adding skill:", error.message);
      alert("Error adding skill: " + error.message);
    });
  });
  document.getElementById("add-interest").addEventListener("click", function () {
    const name = prompt("Enter interest:");
    db.collection("interests").add({
      name: name
    }).then(() => {
      alert("interest added successfully!");
      loadAdminContent(); // Refresh the skills list
    }).catch(error => {
      console.error("Error adding interest:", error.message);
      alert("Error adding interest: " + error.message);
    });
  });
  document.getElementById("add-knowledgebase").addEventListener("click", function () {
    const name = prompt("Enter knowledgebase item name:");
    const link = prompt("Enter knowledgebase item link:");
    db.collection("knowledgebase").add({
      name: name,
      link: link,
    }).then(() => {
      alert("Knowledgebase item added successfully!");
      loadAdminContent(); // Refresh the knowledgebase list
    }).catch(error => {
      console.error("Error adding knowledgebase item:", error.message);
      alert("Error adding knowledgebase item: " + error.message);
    });
  });
  document.getElementById("add-relation").addEventListener("click", function () {
    const name = prompt("Enter relation name:");
    const link = prompt("Enter relation link:");
    const path = prompt("Enter image path:");
    db.collection("relations").add({
      name: name,
      link: link,
      path: path
    }).then(() => {
      alert("Relation added successfully!");
      loadAdminContent(); // Refresh the knowledgebase list
    }).catch(error => {
      console.error("Error adding relation item:", error.message);
      alert("Error adding relation item: " + error.message);
    });
  });
  
  // Load initial data
  function loadAdminContent() {
    fetchAndDisplayData("portfolio", "portfolio-list");
    fetchAndDisplayData("interests", "interests-list");
    fetchAndDisplayData("about", "about-list");
    fetchAndDisplayData("skills", "skills-list");
    fetchAndDisplayData("relations", "relations-list");
    fetchAndDisplayData("knowledgebase", "knowledgebase-list");
  }
  
  // Initial data fetch
  fetchAndDisplayData("portfolio", "portfolio-list");
  fetchAndDisplayData("about", "about-list");
  fetchAndDisplayData("interests", "interests-list");
  fetchAndDisplayData("skills", "skills-list");
  fetchAndDisplayData("relations", "relations-list");
  fetchAndDisplayData("knowledgebase", "knowledgebase-list");
  