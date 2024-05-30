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
const db = firebase.firestore();
const storage = firebase.storage();
new Vue({
    el: '#app',
    data: {
        portfolioItems: [],
        skills: [],
        knowledgebaseItems: [],
        about: [],
        interests: [],
        relations: [],
        resumeDownloadUrl: null,
    },
    created() {
        this.fetchPortfolioItems();
        this.fetchSkills();
        this.fetchKnowledgebaseItems();
        this.fetchAboutMe();
        this.fetchInterests()
        this.fetchRelations();
        this.fetchResumeDownloadUrl();
    },
    updated() {
        this.setRandomBackgroundColors();
    },
    methods: {
        fetchResumeDownloadUrl() {
            const resumepdf = storage.ref('resume.pdf');
            resumepdf.getDownloadURL().then(url => {
                var a = document.getElementById('resume');
                a.setAttribute('href', url);
            }).catch(error => {
                console.error("Error fetching resume download URL:", error.message);
            });
        },
        fetchDataFromFirebase() {
            var storageRef = storage.ref();
            var background = storageRef.child('plant-background.jpg')
            var portrait = storageRef.child('Portrait.jpeg')
            var channelCrm = storageRef.child('ChannelCRM.jpg')
            var zealand = storageRef.child('Zealand.jpg')
            resumepdf.getDownloadURL().then(url => {
                var a = document.getElementById('resume');
                a.setAttribute('href', url);
            }).catch(error => {
                console.error("Error fetching resume download URL:", error.message);
            });
        },
        fetchPortfolioItems() {
            db.collection("portfolio").get().then(querySnapshot => {
                this.portfolioItems = querySnapshot.docs.map(doc => doc.data());
            });
        },
        fetchSkills() {
            db.collection("skills").get().then(querySnapshot => {
                this.skills = querySnapshot.docs.map(doc => doc.data());
            });
        },
        fetchInterests() {
            db.collection("interests").get().then(querySnapshot => {
                this.interests = querySnapshot.docs.map(doc => doc.data());
            });
        },
        fetchAboutMe() {
            db.collection("about").get().then(querySnapshot => {
                this.about = querySnapshot.docs.map(doc => doc.data());
            });
        },
        fetchKnowledgebaseItems() {
            db.collection("knowledgebase").get().then(querySnapshot => {
                this.knowledgebaseItems = querySnapshot.docs.map(doc => doc.data());
            });
        },
        fetchRelations() {
            db.collection("relations").get().then(querySnapshot => {
                this.relations = querySnapshot.docs.map(doc => doc.data());
            });
        },
        getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        },
        setRandomBackgroundColors() {
            const cards = document.querySelectorAll('#knowledgebase .card');
            cards.forEach(card => {
                card.style.backgroundColor = this.getRandomColor();
            });
        }
    },
});
