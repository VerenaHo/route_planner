//TODO fix create map funktion (reset)
//TODO fix load save map
//TODO check texts
//TODO no map names twice
//TODO language de file
//TODO create kleine karte
//TODO create mittlere karte
//TODO create große karte
//TODO load maps at right time

//TODO code clean up html
//TODO code clean up css
//TODO code clean up js

document.getElementById("modal-table-item-left");
const robotModal = document.getElementById("robot-modal"),
    creatorModal = document.getElementById("creator-modal"),
    modalTitle = document.getElementById("modalTitle"),
    closeRobot = document.getElementById("close-robot-modal"),
    closeCreator = document.getElementById("close-creator-modal"),
    closePopup = document.getElementById("close-popup-modal"),
    algorithmText = document.getElementById("algorithm-text"),
    robotGrid = document.getElementById("robot-grid"),
    extraInformationText = document.getElementById("extra-information-text"),
    startButton = document.getElementById("start-button");

const wrapper = document.getElementById("robot-grid"),
    wrapper2 = document.getElementById("map-grid");

let idCounter = 0;
let game=null;
let level=0;
let addBtn = null;
let mapToDelete = null;

let selectedRobots = [],
    selectedMap = null;

const mapGrid = document.getElementById("map-grid");

const maps = [];



const mapSize = 140;

/**
 * initializes the site
 */
function init() {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const gameId = JSON.parse(urlParams.get("game"));
    game =JSON.parse(localStorage.getItem("game-" + gameId));
    if((game.progress)==5){
        document.getElementById("next-button").style.display = "none";;
    }
    createRobotItems();
    // load default maps
    loadDefaultMaps();

    createAddBtn();
    // load maps from local storage
    loadSavedCustomMaps();

}

/**
 * creates all selectable robot items
 */
function createRobotItems() {
    // create all 7 robot items
    for (let i = 1; i <= game.progress+1; i++) {
        // robot item
        let newRobotItem = document.createElement("div");
        newRobotItem.setAttribute("id", "robot-item-" + i);
        newRobotItem.setAttribute("class", "robot-item");
        newRobotItem.setAttribute("data-clickable", "data-clickable");
        robotGrid.appendChild(newRobotItem);

        // robot name
        let robotName = document.createElement("p");
        robotName.innerText = robotNames[i];
        robotName.setAttribute("id", "robot-name-" + i);
        robotName.setAttribute("data-clickable", "data-clickable");
        newRobotItem.appendChild(robotName);

        // robot image
        let robotImage = document.createElement("img");
        robotImage.setAttribute("class", "robot-img-sm");
        robotImage.setAttribute("id", "robot-img-" + i);
        robotImage.setAttribute("src", "../img/robot-" + i + ".png");
        robotImage.setAttribute("data-clickable", "data-clickable");
        newRobotItem.appendChild(robotImage);

        // robot line
        let robotLine = document.createElement("canvas");
        robotLine.setAttribute("id", "line-" + i);
        robotLine.setAttribute("class", "line-canvas");
        robotLine.setAttribute("data-clickable", "data-clickable");
        newRobotItem.appendChild(robotLine);

        let ctx = robotLine.getContext("2d");

        // draw line
        ctx.beginPath();
        ctx.moveTo(150, 0);
        ctx.lineTo(150, 250);
        ctx.strokeStyle = robotColors[i];
        //ctx.setLineDash([10-i, 5-i]);     // --> line dash could be implemented but leads to messy visual representation in the simulation
        ctx.lineWidth = 30;
        ctx.stroke();

        // details button
        let detailsButton = document.createElement("button");
        detailsButton.setAttribute("id", "detailsBtn" + i);
        detailsButton.setAttribute("class", "button details-button");
        detailsButton.innerText = "details";
        newRobotItem.appendChild(detailsButton);
    }
}

function loadDefaultMaps() {
    //TODO add maps + load relevent ones
    for(let i = 0; i < 2; i++) {
        createMapItem(idCounter, defaultMaps[i].mapPoints, defaultMaps[i].mapEdges, defaultMaps[i].title,true);
        idCounter++;
    }
    updateGame();
}

/**
 * creates the add-button and adds it to the html
 */
function createAddBtn() {

    let buttonDiv = document.createElement("div");
    buttonDiv.setAttribute("class", "button-div");
    mapGrid.appendChild(buttonDiv);

    let button = document.createElement("button");
    button.setAttribute("id", "addBtn");
    button.setAttribute("class", "button add-button");
    button.innerText = "\u002B";

    button.addEventListener('click', () => {showCreatorModal();});

    buttonDiv.appendChild(button);
}

function loadSavedCustomMaps() {
    // unsorted
    for (let i=0; i < localStorage.length; i++) {
        let storageKey = localStorage.key(i);

        if(storageKey.startsWith("map")) {
            let mapObject = JSON.parse(localStorage.getItem(storageKey));
            createMapItem(mapObject.id, mapObject.mapPoints, mapObject.mapEdges, mapObject.mapTitle,false);
            idCounter++;
        }
    }
}

function createMapItem(id, mapPoints,mapEdges, mapTitle, defaultMap) {

    let newMap = document.createElement("div");
    newMap.setAttribute("id", "map-" + id);
    newMap.setAttribute("class", "grid-item");
    newMap.setAttribute("data-clickable", "data-clickable");
    if(selectedMap !== null) {
        newMap.style.opacity = "0.4";
    }

    //-------------------------------------------------------------------------------

    if(!defaultMap) {
        let editButton = document.createElement("button");
        editButton.setAttribute("class", "button edit-button");
        editButton.setAttribute("id", "edit-button-" + id);
        editButton.setAttribute("data-edit", "data-edit");
        editButton.innerText = "\u270E";

        newMap.appendChild(editButton);

        let deleteButton = document.createElement("button");
        deleteButton.setAttribute("class", "button delete-button");
        deleteButton.setAttribute("id", "delete-button-" + id);
        deleteButton.setAttribute("data-delete", "data-delete");
        deleteButton.innerText = "\u2716";

        newMap.appendChild(deleteButton);
    }

    //-------------------------------------------------------------------------------

    let title = document.createElement("p");
    title.setAttribute("class", "title-sm");
    title.setAttribute("id", "title-" + id);
    title.setAttribute("data-clickable", "data-clickable");
    title.textContent = mapTitle;

    newMap.appendChild(title);

    //-------------------------------------------------------------------------------

    let canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas-" + id);
    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("data-clickable", "data-clickable");
    canvas.setAttribute("width", "" + mapSize);
    canvas.setAttribute("height", "" + mapSize);

    newMap.appendChild(canvas);
    mapGrid.insertBefore(newMap, mapGrid.children[maps.length]);

    drawCanvas(mapPoints, mapEdges, id, true);

    let mapObject = {id: id, mapPoints: mapPoints,mapEdges:mapEdges, mapTitle: mapTitle};
    maps.push(mapObject);
    localStorage.setItem("map-" + id, JSON.stringify(mapObject));
}

/**
 * adds a map
 * @param mapData the map which gets added
 * @param mapTitle the title of the map
 * @param startPos the position of the start
 * @param finishPos the position of the finish
 */

function addMap(mapPoints,mapEdges, mapTitle) {
    // idCounter needs to check if id already exists
    while(localStorage.getItem("map-" + idCounter) !== null) {
        idCounter++;
    }
    createMapItem(idCounter, mapPoints,mapEdges, mapTitle);

    updateGame();
}

/**
 * updates the html and array of a certain map
 * @param id
 * @param mapData
 * @param mapTitle
 * @param startPos
 * @param finishPos
 */
function updateMap(id, mapPoints,mapEdges, mapTitle) {

    // 1. update html
    let newTitle = document.getElementById("title-" + id);
    newTitle.textContent = mapTitle;
    drawCanvas(mapPoints,mapEdges, id, true );

    // 2. change maps array
    let index = getIndexOf(id);
    let newMap = {id: id, mapPoints:mapPoints,mapEdges:mapEdges, mapTitle: mapTitle};
    maps[index] = newMap;

    // 3. change in local storage
    localStorage.setItem("map-" + id, JSON.stringify(newMap));
}

function updateGame(){
    let mapIds =""
    for (let i = 0; i < maps.length; i++) {
        mapIds += maps[i].id + "_"
    }
    let updatedGame = {id: game.id, gameTitle: game.gameTitle, progress: game.progress, map: mapIds.slice(0,-1) , robots: null};
    localStorage.setItem("game-" + game.id, JSON.stringify(updatedGame));
}

function getPoint(mapPoints,name){
  for (let y = 0; y < mapPoints.length; y++) {
    if(mapPoints[y].name == name){
        return mapPoints[y];
    }
  }
}

/**
 * listens to click events in the robot grid
 */
wrapper.addEventListener('click', (event) => {
    const id = event.target.id;

    if (event.target.matches("[data-clickable]")) {

        let index = id.lastIndexOf('-');
        selectRobot(id.substring(index+1));

    } else if(id !== "robot-grid") {
        showRobotModal(id.slice(-1));
    }
});

/**
 * listens to click events in the map grid
 */
wrapper2.addEventListener('click', (event) => {

    // only detect clicks on items
    if(event.target.matches("[data-clickable]")) {

        const id = event.target.id;
        let index = id.indexOf('-');
        selectMap(parseInt(id.substring(index+1)));

    } else if(event.target.matches("[data-edit]")) {

        const id = event.target.id;
        let index = id.lastIndexOf('-');
        editMap(parseInt(id.substring(index+1)));

    } else if(event.target.matches("[data-delete]")) {

        const id = event.target.id;
        let index = id.lastIndexOf('-');
        confirmDeleteMap(parseInt(id.substring(index+1)));
    }

});

/**
 * opens the creator with the map to edit
 * @param id
 */
function editMap(id) {
    showCreatorModal();

    let index = getIndexOf(id);
    loadMapToEdit(id, maps[index]);
}

function confirmDeleteMap(id) {
    document.getElementById("confirm-modal").style.display = "block";
    mapToDelete = id;

    let title = maps[getIndexOf(id)].mapTitle;
    document.getElementById("confirm-modal-text").innerHTML = "Do you really want to delete map: <b>" + title + "</b>? This process cannot be undone.";
}

/**
 * deletes a map
 */

function deleteMap() {
    // delete in maps list
    let index = getIndexOf(mapToDelete);
    maps.splice(index, 1);

    // delete from local storage
    localStorage.removeItem("map-" + mapToDelete);

    // delete div
    let mapItem = document.getElementById("map-" + mapToDelete);
    mapItem.remove();

    // reset selected
    selectedMap = null;

    const elements = document.getElementsByClassName("grid-item");
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.opacity = "1";
    }

    closeConfirmModal();
}

/**
 * selects a map and saves it as selected
 * @param id the id of the selected map
 */
function selectMap(id) {
    let item = null;

    // change old one
    if(selectedMap !== null) {
        item = document.getElementById("map-" + selectedMap);
        item.style.boxShadow = "inset 0.2rem 0.2rem 0.5rem #c8d0e7, inset -0.2rem -0.2rem 0.5rem #ffffff";

        let editButton = document.getElementById("edit-button-" + selectedMap);
        let deleteButton = document.getElementById("delete-button-" + selectedMap);
        if(editButton !== null) {
            editButton.style.display = "none";
            deleteButton.style.display = "none";
        }

        // deselect map when it's clicked twice
        if(selectedMap === id) {
            selectedMap = null;

            const elements = document.getElementsByClassName("grid-item");
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.opacity = "1";
            }
            return;
        }
    }

    selectedMap = id;

    item = document.getElementById("map-" + id);
    item.style.boxShadow = "0.8rem 0.8rem 0.8rem #c8d0e7, -0.4rem -0.4rem 0.9rem #ffffff";

    // show edit and delete button
    let editButton = document.getElementById("edit-button-" + id);
    let deleteButton = document.getElementById("delete-button-" + id);
    if(editButton !== null) {
        editButton.style.display = "block";
        deleteButton.style.display = "block";
    }

    const elements = document.getElementsByClassName("grid-item");
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.opacity = "0.4";
    }

    item.style.opacity = "1";
}

/**
 * selects a robot and adds it to the selected list
 * @param id the id of the selected robot
 */
function selectRobot(id) {
    const item = document.getElementById("robot-item-" + id);

    if(selectedRobots.includes(id)){
        let index = selectedRobots.indexOf(id);
        if (index > -1) {
            selectedRobots.splice(index, 1);
        }
        item.style.boxShadow = "inset 0.2rem 0.2rem 0.5rem #c8d0e7, inset -0.2rem -0.2rem 0.5rem #ffffff";
        item.style.opacity = "0.4";

        // if no robot selected: make all visible
        if (selectedRobots.length === 0) {
            const elements = document.getElementsByClassName("robot-item");
            for (let i = 1; i < elements.length+1; i++) {
                if(selectedRobots.includes(""+i)){
                    continue;
                }
                elements[i-1].style.opacity = "1";
            }
        }

    } else {

        // limit number of robots to 3
        if (selectedRobots.length >= 3) {
            return;
        }

        selectedRobots.push(id);
        item.style.boxShadow = "0.8rem 0.8rem 0.8rem #c8d0e7, -0.4rem -0.4rem 0.9rem #ffffff";

        const elements = document.getElementsByClassName("robot-item");
        for (let i = 1; i < elements.length+1; i++) {
            if(selectedRobots.includes(""+i)){
                continue;
            }
            elements[i-1].style.opacity = "0.4";
        }

        item.style.opacity = "1";
    }
}

/**
 * opens the robot-modal
 * @param id id of the chosen robot
 */

function showRobotModal(id) {
    robotModal.style.display = "block";

    // set robot image
    let robotImg = document.getElementById("modal-robot-img");
    robotImg.setAttribute("src", "../img/robot-" + id + ".png");

    modalTitle.innerText = robotNames[id];
    extraInformationText.innerText = robotDescriptions[id];
    algorithmText.innerHTML = robotCodeLines[id];
}

/**
 * opens the creator-modal
 */
function showCreatorModal() {
    creatorModal.style.display = "block";
    initCreator();
}

/**
 * closes the robot modal
 */
closeRobot.onclick = function() {
    robotModal.style.display = "none";
}

/**
 * closes the creator modal
 */
closeCreator.onclick = function() {
    closeCreatorModal();
}


/**
 * closes the creator modal
 */
function closeCreatorModal() {
    creatorModal.style.display = "none";
    resetCreator();
}

function closeConfirmModal() {
    document.getElementById("confirm-modal").style.display = "none";
}

/**
 * closes the modal if clicked anywhere outside
 * @param event
 */
window.onclick = function(event) {
    if (event.target === robotModal) {
        robotModal.style.display = "none";
    } else if (event.target === creatorModal) {
        closeCreatorModal();
    }
}

startButton.onclick = function() {
    if (selectedRobots.length === 0 || selectedMap === null) {
        alert("Don't forget to select a map and the robots!");
        return;
    }

    let sMap = maps[getIndexOf(selectedMap)];

    let tempPoints = sMap.mapPoints;
    let points = encodeURIComponent(JSON.stringify(tempPoints));
    let tempEdges = sMap.mapEdges;
    let edges = encodeURIComponent(JSON.stringify(tempEdges));
    let url = "../Simulation/simulation.html?game="+game.id+"&level="+level+"&storyMode=0&points=" + points + "&edges=" + edges + "&robots=";

    // add robots
    for (let i = 0; i < selectedRobots.length; i++) {
        url += selectedRobots[i] + "_";
    }
    // delete last _
    url = url.slice(0, -1);

    let tempRandomStart= Math.floor(Math.random() * sMap.mapPoints.length);
    let tempRandomEnd = Math.floor(Math.random() * sMap.mapPoints.length);
    while(tempRandomStart == tempRandomEnd){
        tempRandomEnd = Math.floor(Math.random() * sMap.mapPoints.length);
    }
    url += "&start=" + sMap.mapPoints[tempRandomStart].name;
    url += "&finish=" + sMap.mapPoints[tempRandomEnd].name;

    document.location.href = url;
}

/**
 * returns the index of a map-object by its id
 * @param id
 * @returns {number}
 */
function getIndexOf(id) {
    let index = 0;
    for (let i = 0; i < maps.length; i++) {
        if(maps[i].id === id) {
            return index;
        }
        index++;
    }
}

function goToPreviousPage() {
    if(game.progress==0){
        document.location.href = "../Start/start.html";
    }else{
        let tempGame = {id: game.id, gameTitle: game.gameTitle, progress: (game.progress-1), map: game.map , robots: game.robots};
        localStorage.setItem("game-" + game.id, JSON.stringify(tempGame));
        location.reload();
    }

}
function goToNextPage() {
    let tempGame = {id: game.id, gameTitle: game.gameTitle, progress: (game.progress+1), map: game.map , robots: game.robots};
    localStorage.setItem("game-" + game.id, JSON.stringify(tempGame));
    location.reload();
}
init();
