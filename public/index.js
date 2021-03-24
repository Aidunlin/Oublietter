let signIn = document.getElementById("signin");
let signOut = document.getElementById("signout");

let newNick = document.getElementById("newnick");
let submitNick = document.getElementById("submitnick");

let newDungeon = document.getElementById("newdungeon");
let submitDungeon = document.getElementById("submitdungeon");

let nameDisplay = document.getElementById("namedisplay");
let nickDisplay = document.getElementById("nickdisplay");
let dungeonDisplay = document.getElementById("dungeondisplay");

let auth;
let db;
let currentNick = "";
let currentDungeon = {};
let currentUserDoc;

let dragRegion = document.getElementById("drag-region");
let drags;
let lines;
let pDrags;

function toggleDisplaySignIn(signedIn) {
  signIn.style.display = signedIn ? "none" : "initial";
  signOut.style.display = signedIn ? "initial" : "none";
  newNick.style.dispay = signedIn ? "initial" : "none";
  submitNick.style.display = signedIn ? "initial" : "none";
  newDungeon.style.dispay = signedIn ? "initial" : "none";
  submitDungeon.style.dispay = signedIn ? "initial" : "none";
}

function handleError(error) {
  console.error(error);
}

// Firebase stuff

function initFirebase() {
  let config = {
    apiKey: "AIzaSyD00g8CdmsRsBf2FRZlpFb1huyHx6sD7VU",
    authDomain: "oublietter-2e397.firebaseapp.com",
    databaseURL: "https://oublietter-2e397.firebaseio.com",
    projectId: "oublietter-2e397",
    storageBucket: "oublietter-2e397.appspot.com",
    messagingSenderId: "233002878038",
    appId: "1:233002878038:web:c9dd507995977d2c1327f7"
  };
  firebase.initializeApp(config);
}

document.addEventListener("DOMContentLoaded", () => {
  initFirebase();
  auth = firebase.auth();
  db = firebase.firestore();
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUserDoc = db.collection("users").doc(user.uid);
      currentUserDoc.get().then(doc => {
        if (doc.exists) {
          currentNick = doc.data().nickname;
          currentDungeon = JSON.parse(doc.data().dungeon);
          createDragsAndLines();
        } else {
          currentNick = user.displayName;
          currentUserDoc.set({ nickname: currentNick }).catch(handleError);
        }
        nickDisplay.innerHTML = currentNick;
        dungeonDisplay.innerHTML = JSON.stringify(currentDungeon);
      }).catch(handleError);
      toggleDisplaySignIn(true);
      nameDisplay.innerHTML = user.displayName;
    } else {
      toggleDisplaySignIn(false);
      nameDisplay.innerHTML = "";
      nickDisplay.innerHTML = "";
      dungeonDisplay.innerHTML = "";
    }
  });
});

signIn.onclick = () => {
  let provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(handleError);
};

signOut.onclick = () => {
  auth.signOut().then(() => currentNick = "").catch(handleError);
};

submitNick.onclick = () => {
  if (auth.currentUser) {
    currentUserDoc.update({ nickname: newNick.value }).then(() => {
      currentNick = newNick.value;
      nickDisplay.innerHTML = currentNick;
      newNick.value = "";
    }).catch(handleError);
  }
}

submitDungeon.onclick = () => {
  if (auth.currentUser) {
    currentUserDoc.update({ dungeon: newDungeon.value }).then(() => {
      currentDungeon = JSON.parse(newDungeon.value);
      dungeonDisplay.innerHTML = newDungeon.value;
      newDungeon.value = "";
    }).catch(handleError);
  }
}

// More UI stuff

function createDragsAndLines() {
  dragRegion.innerHTML = "";
  if (lines) {
    lines.forEach(line => line.remove());
  }
  for (let i = 0; i < currentDungeon.map.length; i++) {
    let newRoom = currentDungeon.map[i];
    let newDiv = document.createElement("div");
    newDiv.classList.add("draggable");
    newDiv.innerHTML = `${newRoom.id}-${newRoom.name}`;
    newDiv.dataset.id = newRoom.id;
    newDiv.dataset.links = JSON.stringify(newRoom.links);
    dragRegion.appendChild(newDiv);
  }
  drags = document.getElementsByClassName("draggable");
  lines = [];
  pDrags = [];
  for (let i = 0; i < drags.length; i++) {
    let linkArray = Object.keys(currentDungeon.map[i].links);
    for (let j = 0; j < linkArray.length; j++) {
      let currentLink = linkArray[j];
      let linkedRoomIndex = currentDungeon.map[i].links[currentLink];
      lines.push(new LeaderLine(drags[i], drags[linkedRoomIndex], {
        color: "rgb(255, 255, 255)",
        size: 2,
        path: "straight",
        startPlug: "behind",
        endPlug: "behind",
      }));
    }
    pDrags.push(new PlainDraggable(drags[i]));
  }
}

function updateLines() {
  if (lines) {
    lines.forEach(line => line.position());
  }
}

setInterval(updateLines, 1000 / 60);
