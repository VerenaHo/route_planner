// TODO remove level heading add some text e.g. robot and map name
// TODO fix buttons (repeat / select start  / select end)
// TODO output log
//TODO adjust simulation only what robot sees more animated
// TODO handle dead end algo

// TODO fix dijkstra
// TODO pop up questions
//TODO language de file
// TODO check multi robot execution

//TODO code clean up html
//TODO code clean up css
//TODO code clean up js

let ctx = null,
    canvasSize = null,
    simulation = {},
    robots = [], // consisting of robot objects with: id, color, posX, posY, currentDirection, path, finished
    step = null,
    radius = null,
    pathWidth = null,
    autoMoveActivated = false;

const outputScreen = document.getElementById("output-screen"),
    canvas = document.getElementById("canvas-0"),
    robotModal = document.getElementById("robot-modal"),
    closeRobot = document.getElementById("close-robot-modal"),
    closePopup = document.getElementById("close-popup-modal"),
    modalTitle = document.getElementById("modalTitle"),
    extraInformationText = document.getElementById("extra-information-text"),
    algorithmText = document.getElementById("algorithm-text"),
    robotGrid = document.getElementById("robot-grid");

const darkGrey = "#808080",
    lightGrey = "#D3D3D3",
    lightGreen = "#B8FF9D";



let selectedRobotId = null,
    robOutputCounter = [], // the number of outputs for every robot
    positionToShow = {x: null, y: null},
    positionToShowIndex = null,
    selectedOutput = null;
let level = 0;
let storyMode = 0;
let game = null;

let start =null,
    finish =null,
    currentPosition=null;
let dijktraPathDistances = [], dijktraVisited=[];

function init() {
    canvasSize = 600;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    ctx = canvas.getContext('2d');

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let gameId = urlParams.get("game");
    game =JSON.parse(localStorage.getItem("game-" + gameId));
    level = JSON.parse(urlParams.get("level"));
    storyMode =JSON.parse(urlParams.get("storyMode"));

    // get map
    simulation.points = JSON.parse(urlParams.get("points"));
    simulation.edges = JSON.parse(urlParams.get("edges"));

    let tempStart = urlParams.get("start");
    start = getPoint(simulation.points,tempStart);
    let tempFinish = urlParams.get("finish");
    finish = getPoint(simulation.points,tempFinish)
    currentPosition =start;

    // get robots
    let temp = urlParams.get("robots");
    initRobots(temp.split("_"));

    // generate robot tabs
    generateRobotTabs();

    document.getElementById("simulation-title").innerText = "Level "+level;
    document.getElementById("simulation-text").innerHTML = levelIntros[level];

    draw(false, false, true);
    for(let i = 0; i < simulation.points.length; i++){

        if(simulation.points[i].name == start.name){
            dijktraPathDistances.push({id:i, endPoint:simulation.points[i], path: [], distance: 0});
            dijktraVisited[i] = true;
        }else{
            dijktraPathDistances.push({id:i, endPoint:simulation.points[i], path: [], distance: Number.MAX_VALUE});
            dijktraVisited[i] = false;
        }
    }

    if(storyMode){
        //TODO popup question
        //TODO deactivate buttons bottom
    }
}

function addLogicStepButton() {
    let grid = document.getElementById("button-grid");
    grid.style.gridTemplateColumns = "auto auto auto";

    let gridItem = document.createElement("div");
    gridItem.setAttribute("class", "button-grid-item");

    grid.insertBefore(gridItem, grid.children[0]);

    let button = document.createElement("button");
    button.setAttribute("class", "button navigation-button");
    button.setAttribute("onclick", "logicStep()");
    button.innerText = "\u203A";

    gridItem.appendChild(button);
}

function generateRobotTabs() {

    let grid = document.getElementById("robot-grid");
    let outputScreen = document.getElementById("output-screen");

    switch (robots.length) {
        case 1:
            grid.style.gridTemplateColumns = "auto";
            break;
        case 2:
            grid.style.gridTemplateColumns = "auto auto";
            break;
        case 3:
            grid.style.gridTemplateColumns = "auto auto auto";
            break;
        default:
            break;
    }

    for (let i = 1; i < robots.length + 1; i++) {
        let robotId = robots[i - 1].id;

        let gridItem = document.createElement("div");
        gridItem.setAttribute("id", "robot-grid-item-" + robotId);
        gridItem.setAttribute("class", "robot-grid-item");
        grid.appendChild(gridItem);

        let robImg = document.createElement("img");
        robImg.setAttribute("id", "robot-img-" + robotId);
        robImg.setAttribute("src", "../img/robot-" + robotId + ".png");
        robImg.setAttribute("class", "img-small");
        gridItem.appendChild(robImg);

        // create output div
        let output = document.createElement("div");
        output.setAttribute("id", "output-robot-" + robotId);
        output.setAttribute("class", "robot-output");
        outputScreen.appendChild(output);

        if (i === 1) {  // select the first robot
            selectedRobotId = parseInt(robots[i - 1].id);
            gridItem.style.backgroundColor = "var(--darkGrey)";
            gridItem.style.marginTop = "0";
            gridItem.style.opacity = "1";
            robImg.style.opacity = "1";
            output.style.display = "block";
        }
    }
}

function initRobots(robotIds) {

    for (let i = 0; i < robotIds.length; i++) {
        robots.push({
            id: robotIds[i], color: robotColors[robotIds[i]],pos: start,
            path: [], shortestPath: [], finished: false
        });
        robOutputCounter[robotIds[i]] = 0;
    }
}

/**
 * draws the map, paths and robots
 * @param showPosition true if canvas is drawn to show a past position
 * @param reset true if showPosition needs to be reset
 * @param moved true if the robot changed position
 */
function draw(showPosition, reset, moved) {

   // ctx.clearRect(0, 0, canvasSize, canvasSize);
    drawCanvas(simulation.points,simulation.edges, 0, false);
    drawStart(start);
    drawFinish(finish);
    let selected = null;
    for (let i = 0; i < robots.length; i++) {
        // skip selected robot (draw it later on top)
        if (parseInt(robots[i].id) !== parseInt(selectedRobotId)) {
            computePath(robots[i], showPosition, moved);
            drawPath(robots[i], showPosition, reset);
        } else {
            selected = i;
        }
    }
    // draw selected robot as last to be on top
    computePath(robots[selected], showPosition, moved);
    drawPath(robots[selected], showPosition, reset);
    for (let i = 0; i < robots.length; i++) {
        if (i !== selected) {
            drawRobot(robots[i], showPosition, reset);
        }
    }
    drawRobot(robots[selected], showPosition, reset);

    // if showPosition: draw past position of the robot
    if (showPosition && positionToShow.x !== null && !reset) {
        // draw past path
        drawPastPath(robots[selected], positionToShowIndex);

        //draw past position
        drawPastPosition(robots[selected]);
    }
}

/**
 * computes the position offset of a robot according to its number in the robots array --> first = middle, second = right, third = left
 * @param robotId
 * @returns {null|number} returns the offset in pixel
 */
function computeOffset(robotId) {
    let number = getIndexOfRobot(robotId);
    if (number === 0) return 0;
    else if (number === 1) return pathWidth;
    else if (number === 2) return -pathWidth;
}

function getPoint(mapPoints,name){
  for (let y = 0; y < mapPoints.length; y++) {
    if(mapPoints[y].name == name){
      return mapPoints[y];
    }
  }
}

function drawPathEdge(ctx,color,x1,y1, x2,y2){
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

}

function computePath(robot, showPosition, moved) {
    // TODO offset two+ robots
   //  add offset to the path to prevent overlapping
   // let offset = computeOffset(parseInt(robot.id));
    let point = robot.pos;

    if (!showPosition && moved) { // only push path if robot moved & if the canvas isn't redrawn to show past position
        robot.path.push(point);
        if(robot.shortestPath.length ==0 || robot.shortestPath[robot.shortestPath.length-1] != point){
            robot.shortestPath.push(point);
        }

    }
}

/**
 * draws the covered path
 */
function drawPath(robot, showPosition, reset) {
    ctx.beginPath();
    for (let i = 1; i < robot.path.length; i++) {
        drawPathEdge(ctx, robot.color, robot.path[i-1].x, robot.path[i-1].y,robot.path[i].x, robot.path[i].y);
    }
}

/**
 * draws an path from the past up to a certain index
 * @param robot
 * @param index the index of the past position
 */
function drawPastPath(robot, index) {
    ctx.beginPath();
    for (let i = 1; i <= index; i++) {
        drawPathEdge(ctx, robot.color, robot.path[i-1].x, robot.path[i-1].y,robot.path[i].x, robot.path[i].y);
    }
}

String.prototype.convertToRGB = function () {

    // delete #
    let color = this.substring(1);

    const aRgbHex = color.match(/.{1,2}/g);
    return [
        parseInt(aRgbHex[0], 16),
        parseInt(aRgbHex[1], 16),
        parseInt(aRgbHex[2], 16)
    ];
}

/**
 * draws the robot
 */
function drawRobot(robot, showPosition, reset) {
    let posX = robot.path[robot.path.length - 1].x;
    let posY = robot.path[robot.path.length - 1].y;

    let myImage = new Image();
    myImage.src = "../img/robot-"+robot.id+".png";
    ctx.drawImage(myImage, posX-12, posY-65, 45, 60);

}

function drawPastPosition(robot) {
    let showPosX = robot.path[positionToShowIndex].x;
    let showPosY = robot.path[positionToShowIndex].y;

    // body
    ctx.beginPath();
    ctx.fillStyle = robot.color;
    ctx.font = radius + 'px Arial';
    ctx.textAlign = "center";
    ctx.arc(showPosX, showPosY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // arrow
    ctx.fillStyle = "#181818";
    //let showPosDirection = computeDirectionNumber(robot.pastDirections[positionToShowIndex]);
    ctx.fillText("robot", showPosX, showPosY + radius / 3);

}

function logicStep() {

    if (robots[0].finished === false) {

        let moved = moveLogicStep(robots[0]);

        draw(false, false, moved);
    }
}
/**
 * calls the appropriate moving-algorithm depending on the robot
 */
function moveOneStep() {

    // if interruption of logic steps
    if (robots.length === 1 && !robOutputDivFinished[robots[0].id]) {

        // remove output
        //document.getElementById("output-wrapper-robot-" + robots[0].id + "-" + robOutputCounter[robots[0].id]).remove();

        // set robot to full step
        robots[0].pos = newPos;

        // add complete output
        addOutput(parseInt(robots[0].id));
        hiddenMarks = 0;
        draw(false, false, true);
        moved = false;
        logicStepCounter = 0;
        return;
    }

    for (let i = 0; i < robots.length; i++) {

        if (robots[i].finished === false) {
            switch (robots[i].id) {
                case '1':
                    random(robots[i]);
                    break;
                case '2':
                    randomMem(robots[i]);
                    break;
                case '3':
                    randomMemDE(robots[i]);
                    break;
                case '4':
                    shortest(robots[i]);
                    break;
                case '5':
                    compass(robots[i]);
                    break;
                case '6':
                    depth(robots[i]);
                    break;
                case '7':
                    dijkstra(robots[i]);
                    break;
                default:
                    break;
            }

            robots[i].pos = newPos;

            logicStepCounter = 0; // reset
            addOutput(parseInt(robots[i].id));
        }
    }
    draw(false, false, true);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function autoMove() {

    autoMoveActivated = !autoMoveActivated;
    let button = document.getElementById("auto-move-button");

    if (autoMoveActivated) {
        button.style.background = "var(--secondary)";
    } else {
        button.style.background = "var(--primary)";
    }

    while (autoMoveActivated && checkIfRobotsStillMoving()) {
        await sleep(100);
        moveOneStep();
    }

    autoMoveActivated = false;
    button.style.background = "var(--primary)";

}

function checkIfRobotsStillMoving() {
    for (let i = 0; i < robots.length; i++) {
        if (robots[i].finished === false) {
            return true;
        }
    }
    return false;
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function showPosition(robotId, position) {

    position = parseInt(position);
    robotId = parseInt(robotId);
    let robot = robots[getIndexOfRobot(robotId)];

    let coordinatePosition = robot.path[position];

    positionToShow.x = Math.floor(coordinatePosition.x );
    positionToShow.y = Math.floor(coordinatePosition.y );

    positionToShowIndex = position;

    draw(true, false, false);

}

function stopShowingPosition() {
    draw(true, true, false);
}

let currentOutputWrapper = [];
/**
 *
 * @param logicId       0 = nothing, 1 = moves, 2 = turns, 3 = moves & turns
 * @param text          the shown text
 * @param robotId       id of the robot
 * @param style         0 = , 1 = , 2 =
 * @param outputEnd
 */
function pushToOutputWrapper(logicId, text, robotId, style, outputEnd) {

    currentOutputWrapper.push({logicId: logicId, text: text, robotId: robotId, style: style, outputEnd: outputEnd});

}

function addOutput(robotId) {

    // create output-wrapper element
    let outputWrapper = document.createElement("div"); // create new div
    outputWrapper.setAttribute("id", "output-wrapper-robot-" + robotId + "-" + robOutputCounter[robotId]);
    outputWrapper.setAttribute("class", "output-wrapper");
    outputWrapper.setAttribute("onmouseover", "showPosition(" + robotId + ", " + robOutputCounter[robotId] + ")");
    outputWrapper.setAttribute("onmouseleave", "stopShowingPosition()");

    let outputDisplay = document.getElementById("output-robot-" + robotId);
    outputDisplay.appendChild(outputWrapper);

    for (let i = 0; i < currentOutputWrapper.length ; i++) {
        let output = document.createElement("code");
        output.setAttribute("class", "output-text");
        output.innerText = currentOutputWrapper[i].text;

        switch (currentOutputWrapper[i].style) {
            case 1:
                output.setAttribute("style", "color: lightGreen;");
                //output.innerText += " \u2713 "; // check mark
                break;
            case 2:
                output.setAttribute("style", "color: white;");
                break;
            case 3:
                output.setAttribute("style", "color: indianRed;");
               // output.innerText += " \u2717 "; // x mark
                break;
        }

        outputWrapper.appendChild(output);
    }

    // auto-scroll --> always show the latest output
    outputScreen.scrollTop = outputScreen.scrollHeight;

    // reset currentOutputWrapper
    currentOutputWrapper = [];

    robOutputCounter[robotId]++;
    robOutputDivFinished[robotId] = true;

}

let robOutputDivFinished = [true, true, true, true, true, true, true, true];
function addOutputLogic(text, robotId, style, outputEnd) {

    if (robOutputDivFinished[robotId]) {
        robOutputDivFinished[robotId] = false;

        let outputWrapper = document.createElement("div"); // create new div
        outputWrapper.setAttribute("id", "output-wrapper-robot-" + robotId + "-" + robOutputCounter[robotId]);
        outputWrapper.setAttribute("class", "output-wrapper");
        outputWrapper.setAttribute("onmouseover", "showPosition(" + robotId + ", " + robOutputCounter[robotId] + ")");
        outputWrapper.setAttribute("onmouseleave", "stopShowingPosition()");

        let outputScreen = document.getElementById("output-robot-" + robotId);
        outputScreen.appendChild(outputWrapper);
    }

    let output = document.createElement("code");
    output.setAttribute("class", "output-text");

    output.innerText = text;

    switch (style) {
        case 1:
            output.setAttribute("style", "color: lightGreen;");
            output.innerText += " \u2713 "; // check mark
            break;
        case 2:
            output.setAttribute("style", "color: white;");
            break;
        case 3:
            output.setAttribute("style", "color: indianRed;");
            output.innerText += " \u2717 "; // x mark
            break;
    }

    let outputWrapper = document.getElementById("output-wrapper-robot-" + robotId + "-" + robOutputCounter[robotId]);
    outputWrapper.appendChild(output);

    if (outputEnd) {
        robOutputCounter[robotId]++;
        robOutputDivFinished[robotId] = true;
        currentOutputWrapper = []; // reset
    }

    // auto-scroll --> always show the latest output
    outputScreen.scrollTop = outputScreen.scrollHeight;
}

robotGrid.addEventListener('click', (event) => {

    let index = event.target.id.lastIndexOf("-");
    let robotId = parseInt(event.target.id.substring(index + 1));

    if (robotId === selectedRobotId) { // show robot modal if selected robot is clicked twice
        showRobotModal('' + robotId);
        return;
    }

    let robotItems = document.getElementsByClassName("robot-grid-item");
    for (let i = 0; i < robotItems.length; i++) {
        robotItems[i].style.opacity = "0.7";
        robotItems[i].style.backgroundColor = "var(--lightGrey)";
        robotItems[i].style.marginTop = "20px";
    }

    document.getElementById("robot-grid-item-" + robotId).style.backgroundColor = "var(--darkGrey)";
    document.getElementById("robot-grid-item-" + robotId).style.opacity = "1";
    document.getElementById("robot-grid-item-" + robotId).style.marginTop = "0";
    document.getElementById("robot-img-" + robotId).style.opacity = "1";

    // show decision output of robot
    // hide old one
    document.getElementById("output-robot-" + selectedRobotId).style.display = "none";
    // show new one
    document.getElementById("output-robot-" + robotId).style.display = "block";

    // scroll to the end
    outputScreen.scrollTop = outputScreen.scrollHeight;

    selectedRobotId = robotId;
    draw(true, true, false);
});

function showRobotModal(id) {
    robotModal.style.display = "block";
    robotModal.style.display = "block";
    // set robot image
    let robotImg = document.getElementById("modal-robot-img");
    robotImg.setAttribute("src", "../img/robot-" + id + ".png");

    modalTitle.innerText = robotNames[id];
    extraInformationText.innerText = robotDescriptions[id];
    algorithmText.innerHTML = robotCodeLines[id];
}

robotModal.onclick = function (event) {
    if (event.target === robotModal || event.target === closeRobot) {
        robotModal.style.display = "none";
    }
}

function goToPreviousPage() {
    window.history.back();
}

/**---------------------------------------------------------------------------------------------------------------------
 *                                                     Algorithms
 ---------------------------------------------------------------------------------------------------------------------*/

/**-------------------------------------
 *           Logic-Step
 -------------------------------------*/
//TODO logic step
let newPos = {};
let logicStepCounter = 0;
let moved = false;
let hiddenMarks = 0; // in order to hide marks until their corresponding logic step is made
/**
 * moves any algorithm one logic step
 */
/*
function moveLogicStep(robot) {

    let index = logicStepCounter;

    if (logicStepCounter === 0) {
        // move one normal step
        switch (robot.id) {
            case '1':
                randomMem(robot);
                break;
            case '2':
                randomMem(robot);
                break;
            case '3':
                randomMemDE(robot);
                break;
            case '4':
                shortest(robot);
                break;
            case '5':
                compass(robot);
                break;
            case '6':
                depth(robot);
                break;
            case '7':
                dijkstra(robot);
                break;
        }
    }

    let justMoved = false;

    switch(currentOutputWrapper[index].logicId) {
        case 0: // nothing
            break;
        case 1: // moves
            robot.pos = newPos
            if (!moved) justMoved = true; //
            break;
        case 2: // turn
            break;
        case 3: // moves & turns
            robot.pos = newPos;
            if (!moved) justMoved = true;
            break;
        case 4: // sets mark
            break;
        case 5: // moves, turns & sets mark
            robot.pos = newPos
            if (!moved) justMoved = true;
            break;
        case 6: // turns first time --> exception for a certain pledge case
            break;
        case 7: // update ariadne Thread
            break;
    }

    addOutputLogic(currentOutputWrapper[index].text, currentOutputWrapper[index].robotId,
        currentOutputWrapper[index].style, currentOutputWrapper[index].outputEnd);

    logicStepCounter++;
    if (currentOutputWrapper.length === 0) {
        logicStepCounter = 0;   // reset
        if (!moved) {
            return true; // needed to save a position of a finished step even though the robot didn't change position
        } else {
            moved = false;
        }
    }

    if (justMoved) {
        moved = true;
        return true;
    }
}
*/
/**-------------------------------------
 *              Random
 -------------------------------------*/

/**
 * random direction algorithm
 */
function random(robot) {
    newPos= robot.pos;

    //check if at destination
    if(finishCheck(robot)) return;

    //collect possible ways
    let possibleWays = [];
    for (let y = 0; y < simulation.edges.length; y++) {
        let pointA= getPoint(simulation.points,simulation.edges[y].from);
        let pointB= getPoint(simulation.points,simulation.edges[y].to);
        if(pointA.name == newPos.name){
            possibleWays.push(pointB);
        }else if(pointB.name == newPos.name){
            possibleWays.push(pointA);
        }
    }
    // randomly select next step
    newPos = possibleWays[getRandomInt(0, possibleWays.length)];
    pushToOutputWrapper(1, "Robot randomly chose to go to " + newPos.name, robot.id, 1, true);
}

/**-------------------------------------
 *              Random Memory
 -------------------------------------*/

/**
 * random direction algorithm no road twice
 */
function randomMem(robot) {
    newPos= robot.pos;

    //check if at destination
    if(finishCheck(robot)) return;

    //collect possible ways
    // ignore used roads
    let possibleWays = [];
    for (let y = 0; y < simulation.edges.length; y++) {
        let pointA= getPoint(simulation.points,simulation.edges[y].from);
        let pointB= getPoint(simulation.points,simulation.edges[y].to);
        if(pointA.name == newPos.name && usedEdgeCount(robot,pointA,pointB)==0){
            possibleWays.push(pointB);
        }else if(pointB.name == newPos.name && usedEdgeCount(robot,pointA,pointB)==0){
            possibleWays.push(pointA);
        }
    }

    // select next step
    if(possibleWays.length === 0){
        // TODO handle stop algo
        // no moves possible
        pushToOutputWrapper(1, "Dead-End", robot.id, 3, true);
    } else {
        // randomly select next step
        newPos = possibleWays[getRandomInt(0, possibleWays.length)];
        pushToOutputWrapper(1, "Robot randomly chose to go to " + newPos.name, robot.id, 1, true);
    }
}
/**-------------------------------------
 *              Random Memory Dead End
 -------------------------------------*/

/**
 * random direction algorithm
 */
function randomMemDE(robot) {
    newPos= robot.pos;

    //check if at destination
    if(finishCheck(robot)) return;

    //collect possible ways
    // ignore used roads
    let possibleWays = [];
    for (let y = 0; y < simulation.edges.length; y++) {
        let pointA= getPoint(simulation.points,simulation.edges[y].from);
        let pointB= getPoint(simulation.points,simulation.edges[y].to);
        if(pointA.name == newPos.name && usedEdgeCount(robot,pointA,pointB)==0){
            possibleWays.push(pointB);
        }else if(pointB.name == newPos.name && usedEdgeCount(robot,pointA,pointB)==0){
            possibleWays.push(pointA);
        }
    }

    // select next step
    if(possibleWays.length === 0){
        //dead end take step back
        robot.shortestPath.pop();
        newPos = robot.shortestPath[robot.shortestPath.length-1];
        pushToOutputWrapper(1, "Dead-End robot took a step back to " + newPos.name, robot.id, 3, false);
    } else {
        // randomly select next step
        newPos = possibleWays[getRandomInt(0, possibleWays.length)];
        pushToOutputWrapper(1, "Robot randomly chose to go to " + newPos.name, robot.id, 1, true);
    }
}
/**-------------------------------------
 *              Shortest
 -------------------------------------*/

/**
 * random direction algorithm
 */
function shortest(robot) {
    newPos= robot.pos;

    //check if at destination
    if(finishCheck(robot)) return;
    let tempLength;
    let shortestPath = null;

    // find shortest road ignore roads taken
    for (let y = 0; y < simulation.edges.length; y++) {
        let pointA= getPoint(simulation.points,simulation.edges[y].from);
        let pointB= getPoint(simulation.points,simulation.edges[y].to);
        if(pointA.name == newPos.name && usedEdgeCount(robot,pointA,pointB)==0 && (shortestPath === null || tempLength > getDistance(pointA,pointB))){
            shortestPath = pointB;
            tempLength = getDistance(pointA,pointB);
        }else if(pointB.name == newPos.name && usedEdgeCount(robot,pointA,pointB)==0  && (shortestPath === null || tempLength > getDistance(pointA,pointB))){
            shortestPath = pointA;
            tempLength = getDistance(pointA,pointB);
        }
    }

    if(shortestPath==null){
        //dead end take step back
        if(robot.shortestPath.length == 0){
            pushToOutputWrapper(1, "Dead-End", robot.id, 3, true);
        }else{
            robot.shortestPath.pop();
            newPos = robot.shortestPath[robot.shortestPath.length-1];
            pushToOutputWrapper(1, "Dead-End robot took a step back to " + newPos.name, robot.id, 3, false);
        }
    }else{
        newPos = shortestPath;
        pushToOutputWrapper(1, "Robot took shortest possible path to go to " + newPos.name, robot.id, 1, true);
    }
}

/**-------------------------------------
 *              compass
 -------------------------------------*/

/**
 * compass
 */
function compass(robot) {
    newPos= robot.pos;

    //check if at destination
    if(finishCheck(robot)) return;
    let tempDirection;
    let directionPath = null;

    // find best drected road ignore roads taken
    for (let y = 0; y < simulation.edges.length; y++) {
        let pointA= getPoint(simulation.points,simulation.edges[y].from);
        let pointB= getPoint(simulation.points,simulation.edges[y].to);
        if(pointA.name == newPos.name && usedEdgeCount(robot,pointA,pointB)==0 && (directionPath === null || tempDirection > getDirection(newPos,pointB))){
            directionPath = pointB;
            tempDirection = getDirection(newPos,pointB);
        }else if(pointB.name == newPos.name && usedEdgeCount(robot,pointA,pointB)==0  && (directionPath === null || tempDirection > getDirection(newPos,pointA))){
            directionPath = pointA;
            tempDirection = getDirection(newPos,pointA);
        }
    }

    if(directionPath==null){
        //dead end take step back
        if(robot.shortestPath.length == 0){
            pushToOutputWrapper(1, "Dead-End", robot.id, 1, true);
        }else{
            robot.shortestPath.pop();
            newPos = robot.shortestPath[robot.shortestPath.length-1];
            pushToOutputWrapper(1, "Dead-End robot took a step back to " + newPos.name, robot.id, 1, false);
        }
    }else{
        newPos = directionPath;
        pushToOutputWrapper(1, "Robot took path pointing in right direction to go to " + newPos.name, robot.id, 1, true);
    }
}
/**-------------------------------------
 *              depth
 -------------------------------------*/

/**
 * depth-first
 */
function depth(robot) {
    newPos= robot.pos;

    //check if at destination
    if(finishCheck(robot)) return;

    //collect possible ways
    // ignore used roads


    let possibleWays = [];
    for (let y = 0; y < simulation.edges.length; y++) {
        let pointA= getPoint(simulation.points,simulation.edges[y].from);
        let pointB= getPoint(simulation.points,simulation.edges[y].to);
        if(pointA.name == newPos.name && usedEdgeCount(robot,pointA,pointB)==0){
            possibleWays.push(pointB);
        }else if(pointB.name == newPos.name && usedEdgeCount(robot,pointA,pointB)==0){
            possibleWays.push(pointA);
        }
    }

    // select next step
    if(possibleWays.length === 0){
        //dead end take step back
        robot.shortestPath.pop();
        newPos = robot.shortestPath[robot.shortestPath.length-1];
        pushToOutputWrapper(1, possibleWays.length+"Dead-End robot took a step back to " + newPos.name, robot.id, 3, false);
    } else {
        // randomly select next step
        newPos = possibleWays[0];
        pushToOutputWrapper(1, "Robot chose to go to " + newPos.name, robot.id, 1, true);
    }
}
/**-------------------------------------
 *              dijkstra
 -------------------------------------*/

/**
 * TODO dijkstra direction algorithm (path line and shortest path and steps taken two lines)
 */
function dijkstra(robot) {

   // dijktraPathDistances
    // save old position & set newPos (needed for logic steps)
    newPos= robot.pos;

    if(finishCheck(robot)) return;

    let possibleWays = [];

    for (let y = 0; y < simulation.edges.length; y++) {
        let pointA= getPoint(simulation.points,simulation.edges[y].from);
        let pointB= getPoint(simulation.points,simulation.edges[y].to);
        if(pointA.name == newPos.name && usedEdgeCount(robot,pointA,pointB)==0){
            possibleWays.push({point:pointB, distance:getDistance(pointA,pointB)});
        }else if(pointB.name == newPos.name && usedEdgeCount(robot,pointA,pointB)==0){
            possibleWays.push({point:pointB, distance:getDistance(pointA,pointB)});
        }
    }

    if(dijktraPathDistances.length==0){
        for (let y = 0; y < possibleWays.length; y++) {
            let tempPath = [];
            tempPath.push(newPos);
            tempPath.push(possibleWays[y].point);
            dijktraPathDistances.push({endPoint:possibleWays[y].point,path:tempPath,distance:possibleWays[y].distance});
        }
    }else{
        let currentId = 0;
        //get current
        for(let y=0; y < dijktraPathDistances.length;y++){
            if(dijktraPathDistances[y].endPoint.name == newPos.name){
                currentId = y;
            }
        }
        for (let y = 0; y < possibleWays.length; y++) {
            for(let j=0; j < dijktraPathDistances.length;j++){
                if(dijktraPathDistances[j].endPoint.name == possibleWays[y].point.name){
                    if(dijktraPathDistances[j].distance > (dijktraPathDistances[currentId].distance + possibleWays[y].distance)){
                        dijktraPathDistances[j].distance = dijktraPathDistances[currentId].distance + possibleWays[y].distance;
                        let tempPath = dijktraPathDistances[currentId].path;
                        tempPath.push(possibleWays[y].point);
                        dijktraPathDistances[j].path = tempPath ;
                    }
                }
            }
        }
    }


    let shortestDistance = Number.MAX_VALUE;
    for(let y=0; y < dijktraPathDistances.length;y++){
        if(dijktraPathDistances[y].distance < shortestDistance && !dijktraVisited[dijktraPathDistances[y].id]){
            dijktraVisited[dijktraPathDistances[y].id] = true;
            newPos = dijktraPathDistances[y].endPoint;
            shortestDistance  =dijktraPathDistances[y].distance;
        }
    }

    pushToOutputWrapper(1, "Robot chose to go to " + newPos.name, robot.id, 1, true);

}

/**-------------------------------------
 *              helpers
 -------------------------------------*/
function usedEdgeCount(robot,pointA,pointB){
    let count =0;
    for(let i=0; i < robot.path.length-1; i++){
        if(robot.path[i].name == pointA.name && robot.path[i+1].name == pointB.name){
            count++;
        }else if (robot.path[i].name == pointB.name && robot.path[i+1].name == pointA.name){
            count++;
        }
    }
    return count;
}

function getDistance(pointA, pointB){
    let a = pointA.x - pointB.x;
    let b = pointA.y - pointB.y;
    return Math.sqrt( a*a + b*b );
}

function getDirection(current, point){
    let current2finish = {x:(finish.x-current.x), y:(finish.y-current.y)};
    let current2point ={x:(point.x-current.x), y:(point.y-current.y)};
    let angle = Math.acos((current2finish.x*current2point.x + current2finish.y*current2point.y)/(Math.sqrt(current2finish.x*current2finish.x+current2finish.y*current2finish.y)*Math.sqrt(current2point.x*current2point.x+current2point.y*current2point.y)));
    if (angle > 180){
        angle = 360-angle;
    }
    return angle;

}
function finishCheck(robot) {
    if (robot.pos.name === finish.name ) {
        sameEdgeCount = 0
        for (let y = 0; y < simulation.edges.length; y++) {
            let pointA= getPoint(simulation.points,simulation.edges[y].from);
            let pointB= getPoint(simulation.points,simulation.edges[y].to);
            if(usedEdgeCount(robot,pointA,pointB)>1){
                sameEdgeCount++;
            }
        }
        pushToOutputWrapper(0, "FINISHED! (" + (robot.path.length - 1) + " step(s) & "+sameEdgeCount+" road(s) used multiple times)", robot.id, 1, true);

        robot.finished = true;
        return true;
    }
    return false;
}

init();

/* detect hover on canvas
canvas.onmousemove = function (event) {

    let rect = this.getBoundingClientRect();
    let mouseX = event.clientX - rect.left; // pixel-coordinates
    let mouseY = event.clientY - rect.top;

    let posX = Math.floor(mouseX / step); // labyrinth-coordinates
    let posY = Math.floor(mouseY / step);

    if (positionToShow.x !== posX || positionToShow.y !== posY) { // only detect new segments of labyrinth

        positionToShow.x = posX;
        positionToShow.y = posY;

        if (simulation.map[posY][posX] === 1) { // check if there's a way

            let robotIndex = getIndexOfRobot(selectedRobotId);
            let outputIndex = getIndexOfOutput(robots[robotIndex], posX, posY); // check if there's a path

            if (outputIndex !== null) {
                positionToShowIndex = outputIndex;
                if (selectedOutput !== null) selectedOutput.setAttribute("class", "output-wrapper"); // reset old output
                draw(true, false, false); // draw position on canvas

                selectedOutput = document.getElementById("output-wrapper-robot-" + selectedRobotId + "-" + outputIndex);
                selectedOutput.setAttribute("class", "output-wrapper-highlighted"); // highlight output
                selectedOutput.scrollIntoView({block: "end", behavior: "smooth"}); // automatically scroll to the output element
            } else {
                draw(true, true, false);
                if (selectedOutput !== null) selectedOutput.setAttribute("class", "output-wrapper"); // reset output
            }

        } else {
            draw(true, true, false);
            if (selectedOutput !== null) selectedOutput.setAttribute("class", "output-wrapper"); // reset output
        }
    }
}

// reset highlighted output if mouse leaves canvas
canvas.onmouseleave = function () {

    positionToShow.x = null; // reset positionToShow
    positionToShow.y = null;
    if (selectedOutput !== null) selectedOutput.setAttribute("class", "output-wrapper"); // reset output

    draw(true, true, false); // reset canvas
}

function getIndexOfOutput(robot, posX, posY) {

    for (let i = 0; i < robot.path.length - 1; i++) {

        let pathX = Math.floor(robot.path[i].x / step);
        let pathY = Math.floor(robot.path[i].y / step);

        if (pathX === posX && pathY === posY) {
            return i;
        }
    }
    return null;
}
*/
function getIndexOfRobot(id) {
    for (let i = 0; i < robots.length; i++) {
        if (parseInt(robots[i].id) === id) {
            return i;
        }
    }
    return null;
}


function tryMore(){

    if(game.progress <= level){
        let updatedGame = {id: game.id, gameTitle: game.gameTitle, progress:(level), map: game.map , robots: game.robots};
        localStorage.setItem("game-" + game.id, JSON.stringify(updatedGame));
    }
    document.location.href = "../Selection/selection.html?game="+game.id+"&level="+level+"&storyMode=0";
}

function nextLevel(){
    if(game.progress <= level){
        let updatedGame = {id: game.id, gameTitle: game.gameTitle, progress:(level), map: game.map , robots: game.robots};
        localStorage.setItem("game-" + game.id, JSON.stringify(updatedGame));
    }
    document.location.href = "../Level/level.html?game="+game.id+"&storyMode=1";
}

function showPopUpModal(){
    document.getElementById("popup-modal").style.display = "block";
}

function closePopUpModal(){
    document.getElementById("popup-modal").style.display = "none";
}

closePopup.onclick = function() {
    closePopUpModal();
}




function enterAnswer(answer){

}

function repeatLevel(){
    //reset level
    dijktraPathDistances = [];
    location.reload();

}