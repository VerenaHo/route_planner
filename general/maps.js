// TODO add maps for each level
// TODO beautify drawmap
const defaultMaps = [
    {id:0, mapPoints:[{name:"A",x:40,y:40},
            {name:"B",x:200,y:400},
            {name:"C",x:30,y:150},
            {name:"D",x:200,y:100},
            {name:"E",x:75,y:450},
            {name:"F",x:333,y:70},
            {name:"G",x:466,y:456}],
        mapEdges:[{from:"A",to:"C"},
            {from:"A",to:"F"},
            {from:"A",to:"D"},
            {from:"D",to:"F"},
            {from:"F",to:"G"},
            {from:"B",to:"E"},
            {from:"B",to:"G"},
            {from:"C",to:"E"},
            {from:"C",to:"D"},
            {from:"D",to:"G"},
            {from:"B",to:"C"},
            {from:"A",to:"D"},
            {from:"B",to:"D"}
        ], title: "simple-map"},{
        id: 1,
        mapPoints: [
            {name: "A",x: 84,y: 66.5},
            {name: "B",x: 386,y: 65.5},
            {name: "C",x: 389,y: 260.5},
            {name: "D",x: 213,y: 265.5},
            {name: "E",x: 218,y: 161.5},
            {name: "F",x: 77,y: 268.5},
            {name: "G",x: 389,y: 466.5},
            {name: "H",x: 215,y: 466.5},
            {name: "I",x: 508,y: 373.5},
            {name: "J",x: 503,y: 252.5},
            {name: "K",x: 487,y: 152.5},
            {name: "L",x: 514,y: 59.5}
        ],
        mapEdges: [
            {
                from: "B",
                to: "A"
            },
            {
                from: "C",
                to: "B"
            },
            {
                from: "D",
                to: "C"
            },
            {
                from: "E",
                to: "D"
            },
            {
                from: "F",
                to: "D"
            },
            {
                from: "G",
                to: "C"
            },
            {
                from: "K",
                to: "L"
            },
            {
                from: "J",
                to: "K"
            },
            {
                from: "C",
                to: "J"
            },
            {
                from: "J",
                to: "I"
            },
            {
                from: "H",
                to: "G"
            }
        ],
        title: "Dead-ends"
    }];

function drawCanvas(mapPoints,mapEdges, id, small) {
    let canvas = document.getElementById("canvas-" + id);
    let ctx = canvas.getContext("2d");
    if(small){
        ctx.scale(0.20,0.20);
    }
    drawMap(ctx, canvas, mapPoints,mapEdges);
}

function drawMap(ctx, canvas, mapPoints,mapEdges) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px Arial";
    const h = canvas.height;
    for (let y = 0; y < mapEdges.length; y++) {
        let pointA= getPoint(mapPoints,mapEdges[y].from);
        let pointB= getPoint(mapPoints,mapEdges[y].to);
        drawEdge(ctx,pointA.x, pointA.y,pointB.x, pointB.y)
    }
    for (let y = 0; y < mapPoints.length; y++) {
        drawPoint(ctx,mapPoints[y].name, mapPoints[y].x, mapPoints[y].y);
    }

}

function drawStart(start){
    ctx.beginPath();
    ctx.arc(start.x, start.y, 22, 0, 2 * Math.PI);
    ctx.fillStyle = 'lightGreen';
    ctx.strokeStyle = 'lightGreen';
    ctx.fill();
    ctx.stroke();

    ctx.font = "20pt Arial";
    ctx.fillStyle = 'white';
    ctx.textAlign ="center";
    ctx.fillText(start.name, start.x, start.y+10);
}
function drawFinish(finish){
    ctx.beginPath();
    ctx.arc(finish.x, finish.y, 22, 0, 2 * Math.PI);
    ctx.fillStyle = 'indianRed';
    ctx.strokeStyle = 'indianRed';
    ctx.fill();
    ctx.stroke();

    ctx.font = "20pt Arial";
    ctx.fillStyle = 'white';
    ctx.textAlign ="center";
    ctx.fillText(finish.name, finish.x, finish.y+10);
}

function drawPoint(ctx,name,x,y){
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#00467f';
    ctx.strokeStyle = '#00467f';
    ctx.fill();
    ctx.stroke();

    ctx.font = "20pt Arial";
    ctx.fillStyle = 'white';
    ctx.textAlign ="center";
    ctx.fillText(name, x, y+10);
}

function drawEdge(ctx,x1,y1, x2,y2){
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#00467f';
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'white';
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}