//TODO no name twice

let edit = false;

let createMapCanvas = document.getElementById("canvas-map");
let ctx = createMapCanvas.getContext("2d");


// colors
const darkGrey = "#808080",
    lightGrey = "#D3D3D3";

// important data
let mapTitle = "New Map";
let editMapId = null;
let map = null;
let startX=0,startY=0;
let drag = false;
let points = [];
let edges = [];

function initCreator() {
   // createMap(size);
    map = null;
    points = [];
    edges = [];
    createMapCanvas = document.getElementById("canvas-map");
    ctx = createMapCanvas.getContext("2d");
    ctx.clearRect(0,0,createMapCanvas.width,createMapCanvas.height);
    editMapId = null;
}

createMapCanvas.onmousedown = function(e){
    let rect = createMapCanvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    drag=false;
}

createMapCanvas.onmousemove = function (e){
    drag=true;
}

createMapCanvas.onmouseup = function(e){
    if(drag){
        let rect = createMapCanvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        if(existingPoint(ctx,x,y) && existingPoint(ctx,startX,startY)){
            let pointA = getClickedPoint(ctx,x,y);
            let pointB = getClickedPoint(ctx,startX,startY);
            if(pointA != null && pointB != null && !edgeExists(pointA.name,pointB.name)){
                edges.push({from:pointA.name,to:pointB.name});
                drawEdge(ctx,pointA.x, pointA.y,pointB.x, pointB.y);
                drawPoint(ctx,pointA.name,pointA.x, pointA.y);
                drawPoint(ctx,pointB.name,pointB.x, pointB.y);
            }
        }
    }else{
        let ctx = createMapCanvas.getContext("2d");
        let rect = createMapCanvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        if(existingPoint(ctx,x,y)){
            //TODO option delet or rename edge point

        }else{
            let name = prompt("Please enter your point name:", "Point XY");
            if (name == null || name == "") {
                  //cancel creation
            } else {
                let point = {name: name,x: x,y: y};
                points.push( point);
                drawPoint(ctx,name,x,y);
            }
        }
    }
    drag=false;
}

function existingPoint(ctx,x,y){
    for (let i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 20, 0, 2 * Math.PI);
        if (ctx.isPointInPath(x, y)) {
            return true;
        }
    }
    return false;
}

function getClickedPoint(ctx,x,y){
    for (let i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 20, 0, 2 * Math.PI);
        if (ctx.isPointInPath(x, y)) {
            return points[i];
        }
    }
    return null;
}

function edgeExists(pointA,pointB){
    for (let i = 0; i < edges.length; i++) {
        if((edges[i].from == pointA && edges[i].to == pointB)|| (edges[i].from == pointB && edges[i].to == pointA)){
            return true;
        }
    }
    return false;
}

function loadMapToEdit(mapId, mapObj) {

    edit = true;
    editMapId = mapId;
    mapTitle = mapObj.mapTitle;
    points = mapObj.mapPoints;
    edges = mapObj.mapEdges;
    // set title
    let mapName = document.getElementById("map-name");
    mapName.setAttribute("placeholder", mapObj.mapTitle);

    drawMap(ctx,createMapCanvas,points,edges);
}

/**
 * creates the final map and saves it to the map-array
 */
function saveMap() {

    // set the name if changed
    let temp = document.getElementById("map-name").value;

    if (temp.length !== 0) {
        mapTitle = temp;
    }else {
        alert("Please enter a Map name");
        return;
    }

    if(edit) {
        updateMap(editMapId, points, edges, mapTitle);
        edit = false;
    } else {
        addMap(points, edges, mapTitle);
    }

    closeCreatorModal();
}

function resetCreator(){
    initCreator();
}


function showHelpText(){
    alert("how to");
}

initCreator();