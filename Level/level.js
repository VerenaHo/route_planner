//TODO beautify overview


document.getElementById("modal-table-item-left");
const     levelGrid = document.getElementById("level-grid");

const levels=7;
let currentLevel=0;
let game=null;

let storyMode=true;

function init() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const gameId = JSON.parse(urlParams.get("game"));
    game =JSON.parse(localStorage.getItem("game-" + gameId));
    storyMode =JSON.parse(urlParams.get("storyMode"));

    document.getElementById("game-title").innerText = game.gameTitle;
    loadLevels();

    if(game.progress===0){
        currentLevel=0;
        storyModus(1);
    }else if (storyMode && game.progress<7) {
        currentLevel=JSON.parse(game.progress);
        storyModus();
    }else{
        currentLevel=JSON.parse(game.progress);
    }

}

function loadLevels(){
    // create all 7 level items
    for (let i = 1; i <= levels; i++) {
        let levelItem = document.createElement("div");
        levelItem.setAttribute("id", "level-item-" + i);

        if(i<=game.progress){
            levelItem.setAttribute("style", "box-shadow: 0.8rem 0.8rem 0.8rem #c8d0e7, -0.4rem -0.4rem 0.9rem #ffffff; opacity: 1;");
        }else{
            levelItem.setAttribute("style", "box-shadow: inset 0.2rem 0.2rem 0.5rem #c8d0e7, inset -0.2rem -0.2rem 0.5rem #ffffff; opacity: 0.4;");
        }
        levelItem.setAttribute("class", "level-grid");

        let levelName = document.createElement("div");
        levelName.setAttribute("class","level-name");
        levelName.setAttribute("style","border-radius: 0.317rem;box-shadow: 0.8rem 0.8rem 0.8rem #c8d0e7, -0.4rem -0.4rem 0.9rem #ffffff;background:"+robotColors[i]+";" )
        levelName.setAttribute("id", "level-name-" + i);
        levelName.innerText = "Level " + i;
        levelItem.appendChild(levelName)

        let levelStory = document.createElement("div");
        levelStory.setAttribute("class","level-text");
        levelStory.setAttribute("id", "level-text-" + i);
        levelStory.innerText = levelIntrosShort[i];
        levelItem.appendChild(levelStory);

        let levelButtonStory = document.createElement("button");

        if(i<=game.progress){
            levelButtonStory.setAttribute("id", "level-button-active-" + i);
            levelButtonStory.setAttribute("class", "button level-button-active");
        }else{
            levelButtonStory.setAttribute("id", "level-button-inactive-" + i);
            levelButtonStory.setAttribute("class", "button level-button-inactive");
        }

        levelButtonStory.innerText = "repeat level";
        levelItem.appendChild(levelButtonStory);

        levelGrid.insertAdjacentElement("beforeend", levelItem);

    }
}

function continueStory(){
    currentLevel=JSON.parse(game.progress);
    storyModus();
}

function storyModus(){
    storyMode=true;
    document.getElementById("confirm-modal").style.display = "block";
    document.getElementById("modal-robot-img").setAttribute("src","../img/robot-"+(currentLevel+1)+".png")
    document.getElementById("confirm-modal-titel").innerHTML = "Level "+(currentLevel+1);
    document.getElementById("confirm-modal-text").innerHTML = levelIntros[currentLevel+1];
}

function manualModus(){
    storyMode=false;
    document.getElementById("confirm-modal").style.display = "block";
    document.getElementById("modal-robot-img").setAttribute("src","../img/manual-mode.png")
    document.getElementById("confirm-modal-titel").innerHTML = "Manual Mode";
    document.getElementById("confirm-modal-text").innerHTML = "By continuing the story you can unlock more features!";
}

function startNextPage(){
    if(storyMode){
        document.location.href = "../Selection/selection.html?game="+game.id+"&level="+(currentLevel+1)+"&storyMode=1";
    }else{
        document.location.href = "../Selection/selection.html?game="+game.id+"&level="+currentLevel+"&storyMode=0";
    }
}

function closeConfirmModal() {
    document.getElementById("confirm-modal").style.display = "none";
}

levelGrid.addEventListener('click', (event) => {

    const id = event.target.id;
    if(id.startsWith("level-button-active-",0) ) {
        currentLevel = JSON.parse(id.slice(-1))-1;
        storyModus();
    }
});

function goToPreviousPage(){
    window.history.back();
}

init();