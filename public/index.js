let nameText = document.getElementById("name-text");
let signInBtn = document.getElementById("sign-in");
let signOutBtn = document.getElementById("sign-out");
let newDungeonInput = document.getElementById("new-dungeon");
let submitDungeonBtn = document.getElementById("submit-dungeon");
let dungeonWrap = document.getElementById("dungeon-wrap");
let dungeonView = document.getElementById("dungeon-view");
let dungeonText = document.getElementById("dungeon-text");

let auth;
let db;
let currentDungeon = {};
let currentUserDoc;

let drags;
let lines;
let pDrags;
let lLines;

function toggleDisplaySignIn(signedIn) {
  signInBtn.style.display = signedIn ? "none" : "initial";
  signOutBtn.style.display = signedIn ? "initial" : "none";
  newDungeonInput.style.dispay = signedIn ? "initial" : "none";
  submitDungeonBtn.style.dispay = signedIn ? "initial" : "none";
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
          currentDungeon = JSON.parse(doc.data().dungeon);
          createDragsAndLines();
        } else {
          currentUserDoc.set({}).catch(handleError);
        }
        dungeonText.innerHTML = JSON.stringify(currentDungeon);
      }).catch(handleError);
      toggleDisplaySignIn(true);
      nameText.innerHTML = user.displayName;
    } else {
      toggleDisplaySignIn(false);
      nameText.innerHTML = "";
      dungeonText.innerHTML = "";
      createDragsAndLines();
    }
  });
});

signInBtn.onclick = () => {
  let provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(handleError);
};

signOutBtn.onclick = () => {
  auth.signOut().catch(handleError);
};

submitDungeonBtn.onclick = () => {
  if (auth.currentUser) {
    currentUserDoc.update({ dungeon: newDungeonInput.value }).then(() => {
      currentDungeon = JSON.parse(newDungeonInput.value);
      dungeonText.innerHTML = newDungeonInput.value;
      newDungeonInput.value = "";
    }).catch(handleError);
  }
}

// More UI stuff

function createDragsAndLines() {
  if (lines) {
    lines.forEach(line => line.remove());
  }
  dungeonView.innerHTML = "";
  for (let i = 0; i < currentDungeon.map?.length; i++) {
    let newRoom = currentDungeon.map[i];
    let newDiv = document.createElement("div");
    newDiv.classList.add("draggable");
    newDiv.innerHTML = "<span>" + newRoom.name + "</span>";
    newDiv.dataset.id = newRoom.id;
    newDiv.dataset.links = JSON.stringify(newRoom.links);
    dungeonView.appendChild(newDiv);
  }
  drags = document.getElementsByClassName("draggable");
  lines = [];
  pDrags = [];
  for (let i = 0; i < drags.length; i++) {
    let linkArray = Object.keys(currentDungeon.map[i].links);
    for (let j = 0; j < linkArray.length; j++) {
      let currentLink = linkArray[j];
      let linkedRoomIndex = currentDungeon.map[i].links[currentLink];
      let lineOptions = {
        color: "rgb(255, 255, 255)",
        size: 2,
        path: "straight",
        startPlug: "behind",
        endPlug: "behind",
      };
      let newLine = new LeaderLine(drags[i], drags[linkedRoomIndex], lineOptions);
      lines.push(newLine);
    }
    pDrags.push(new PlainDraggable(drags[i], {
      autoScroll: dungeonWrap,
    }));
  }
  lLines = document.getElementsByClassName("leader-line");
  for (let i = 0; i < lLines.length; i++) {
    dungeonView.appendChild(lLines[i]);
  }
}

function updateLines() {
  if (lines) {
    lines.forEach(line => line.position());
  }
}

setInterval(updateLines, 1000 / 60);
