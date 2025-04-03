import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import{getFirestore, getDoc, doc} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"

  const firebaseConfig = {
    apiKey: "AIzaSyA8742Bs5nzfmPd5PkkE4-G8oVJR-38Mrw",
    authDomain: "engagement-portal-39346.firebaseapp.com",
    projectId: "engagement-portal-39346",
    storageBucket: "engagement-portal-39346.firebasestorage.app",
    messagingSenderId: "119604507798",
    appId: "1:119604507798:web:7201634d294fc1312bfeb7"
  };

 
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  
  const auth=getAuth();
  const db=getFirestore();

  onAuthStateChanged(auth, (user)=>{
    const loggedInUserId=localStorage.getItem('loggedInUserId');
    if(loggedInUserId){
        console.log(user);
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef)
        .then((docSnap)=>{
            if(docSnap.exists()){
                const userData=docSnap.data();
                document.getElementById('loggedUserFName').innerText=userData.firstName;
                document.getElementById('loggedUserEmail').innerText=userData.email;
                document.getElementById('loggedUserLName').innerText=userData.lastName;

            }
            else{
                console.log("no document found matching id")
            }
        })
        .catch((error)=>{
            console.log("Error getting document");
        })
    }
    else{
        console.log("User Id not Found in Local storage")
    }
  })

  const logoutButton=document.getElementById('logout');

  logoutButton.addEventListener('click',()=>{
    localStorage.removeItem('loggedInUserId');
    signOut(auth)
    .then(()=>{
        window.location.href='index.html';
    })
    .catch((error)=>{
        console.error('Error Signing out:', error);
    })
  })
  const database = firebase.database();

  // ======================
// FIREBASE DATA HANDLING
// ======================

function saveUserData(userId) {
  const userData = {
    stars: appData.stars,
    totalTasksCompleted: appData.totalTasksCompleted,
    currentSet: appData.currentSet,
    setData: appData.setData,
    cooldownTimers: appData.cooldownTimers,
    taskCompletions: appData.taskCompletions,
    survey: {
      answers: survey.answers,
      completions: survey.completions,
      currentQuestion: survey.currentQuestion,
      cooldownEnd: survey.cooldownEnd
    },
    kycData: JSON.parse(localStorage.getItem('kycData')) || null,
    lastUpdated: firebase.database.ServerValue.TIMESTAMP
  };

  database.ref('users/' + userId).set(userData)
    .then(() => {
      console.log('Data saved successfully to Firebase');
      // Also save to local storage as fallback
      saveLocalData();
    })
    .catch(error => {
      console.error('Error saving to Firebase, using local storage:', error);
      saveLocalData();
    });
}

function loadUserData(userId) {
  database.ref('users/' + userId).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (data) {
        // Update app data from Firebase
        appData.stars = data.stars || 0;
        appData.totalTasksCompleted = data.totalTasksCompleted || 0;
        appData.currentSet = data.currentSet || 1;
        appData.setData = data.setData || initializeSetData();
        appData.cooldownTimers = data.cooldownTimers || {};
        appData.taskCompletions = data.taskCompletions || [];
        
        // Update survey data
        survey.answers = data.survey?.answers || [];
        survey.completions = data.survey?.completions || [];
        survey.currentQuestion = data.survey?.currentQuestion || 0;
        survey.cooldownEnd = data.survey?.cooldownEnd || null;
        
        // Update KYC data
        if (data.kycData) {
          localStorage.setItem('kycData', JSON.stringify(data.kycData));
        } else {
          localStorage.removeItem('kycData');
        }
        
        // Update UI
        updateUI();
        console.log('Data loaded from Firebase');
      } else {
        // New user - initialize data
        appData.setData = initializeSetData();
        updateUI();
      }
    })
    .catch(error => {
      console.error('Error loading from Firebase, using local storage:', error);
      loadLocalData();
    });
}

function saveLocalData() {
  localStorage.setItem('stars', appData.stars);
  localStorage.setItem('totalTasksCompleted', appData.totalTasksCompleted);
  localStorage.setItem('currentSet', appData.currentSet);
  localStorage.setItem('setData', JSON.stringify(appData.setData));
  localStorage.setItem('cooldownTimers', JSON.stringify(appData.cooldownTimers));
  localStorage.setItem('taskCompletions', JSON.stringify(appData.taskCompletions));
  localStorage.setItem('surveyCooldownEnd', survey.cooldownEnd);
  localStorage.setItem('surveyCompletions', JSON.stringify(survey.completions));
  console.log('Data saved to local storage');
}

function loadLocalData() {
  appData.stars = parseInt(localStorage.getItem('stars')) || 0;
  appData.totalTasksCompleted = parseInt(localStorage.getItem('totalTasksCompleted')) || 0;
  appData.currentSet = parseInt(localStorage.getItem('currentSet')) || 1;
  appData.setData = JSON.parse(localStorage.getItem('setData')) || initializeSetData();
  appData.cooldownTimers = JSON.parse(localStorage.getItem('cooldownTimers')) || {};
  appData.taskCompletions = JSON.parse(localStorage.getItem('taskCompletions')) || [];
  
  survey.answers = [];
  survey.currentQuestion = 0;
  survey.cooldownEnd = parseInt(localStorage.getItem('surveyCooldownEnd')) || null;
  survey.completions = JSON.parse(localStorage.getItem('surveyCompletions')) || [];
  
  updateUI();
  console.log('Data loaded from local storage');
}

function updateUI() {
  updateStars();
  updateTotalTasksCount();
  checkAllCooldowns();
  renderSetSelector();
  renderTasks(appData.currentSet);
  setupEventListeners();
  checkReturningUser();
  initSurvey();
  initKYC();
}
