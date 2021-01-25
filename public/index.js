let signIn = document.getElementById("signin");
let signOut = document.getElementById("signout");

let newNick = document.getElementById("newnick");
let submitNick = document.getElementById("submitnick");

let newDungeon = document.getElementById("newdungeon");
let submitDungeon = document.getElementById("submitdungeon");

let nameDisplay = document.getElementById("namedisplay");
let nickDisplay = document.getElementById("nickdisplay");
let dungeonDisplay = document.getElementById("dungeondisplay");

function toggleDisplaySignIn(signedIn) {
  signIn.style.display = signedIn ? "none" : "initial";
  signOut.style.display = signedIn ? "initial" : "none";
  newNick.style.dispay = signedIn ? "initial" : "none";
  submitNick.style.display = signedIn ? "initial" : "none";
  newDungeon.style.dispay = signedIn ? "initial" : "none";
  submitDungeon.style.dispay = signedIn ? "initial" : "none";
}

document.addEventListener('DOMContentLoaded', () => {
  let config = {
    apiKey: "AIzaSyD00g8CdmsRsBf2FRZlpFb1huyHx6sD7VU",
    authDomain: "oublietter-2e397.firebaseapp.com",
    databaseURL: "https://oublietter-2e397.firebaseio.com",
    projectId: "oublietter-2e397",
    storageBucket: "oublietter-2e397.appspot.com",
    messagingSenderId: "233002878038",
    appId: "1:233002878038:web:c9dd507995977d2c1327f7"
  }
  firebase.initializeApp(config);

  const auth = firebase.auth();
  const db = firebase.firestore();

  let currentNick = "";
  let currentDungeon = "";
  let userDoc;

  auth.onAuthStateChanged(user => {
    if (user) {
      userDoc = db.collection("users").doc(user.uid);
      userDoc.get().then(doc => {
        if (doc.exists) {
          currentNick = doc.data().nickname;
          currentDungeon = doc.data().dungeon;
        } else {
          currentNick = user.displayName;
          userDoc.set({
            nickname: currentNick
          }).catch(error => console.log("Error adding document: " + error));
        }
        nickDisplay.innerHTML = currentNick;
        dungeonDisplay.innerHTML = currentDungeon;
      }).catch(error => console.log("Error getting document: " + error));
      
      toggleDisplaySignIn(true);
      nameDisplay.innerHTML = user.displayName;
    } else {
      toggleDisplaySignIn(false);
      nameDisplay.innerHTML = "";
      nickDisplay.innerHTML = "";
      dungeonDisplay.innerHTML = "";
    }
  });

  signIn.onclick = () => {
    let provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(error => console.log("Error getting auth: " + error));
  };

  signOut.onclick = () => {
    auth.signOut().then(() => {
      currentNick = "";
    }).catch(error => console.log("Error signing out: " + error));
  };

  submitNick.onclick = () => {
    if (auth.currentUser) {
      userDoc.update({ nickname: newNick.value }).then(() => {
        currentNick = newNick.value;
        nickDisplay.innerHTML = currentNick;
        newNick.value = "";
      }).catch(error => console.log("Error updating nick: " + error));
    }
  }

  submitDungeon.onclick = () => {
    if (auth.currentUser) {
      userDoc.update({ dungeon: newDungeon.value }).then(() => {
        dungeonDisplay.innerHTML = newDungeon.value;
        newDungeon.value = "";
      }).catch(error => console.log("Error updating dungeon: " + error))
    }
  }
});