//later
//TODO code clean up css html js

const gameGrid = document.getElementById("grid-container"),
    continueButton = document.getElementById("continue-button");

const games = [];

let selectedGame = null;
let gameToDelete = null;

function init() {
    // init all texts in start.js
    document.getElementById("game-title").innerText =game_title;
    document.getElementById("game-title2").innerText =game_title2;
    document.getElementById("create-game-button").setAttribute("title",createNewGame_title);
    document.getElementById("continue-button").innerText =continue_button;
    document.getElementById("confirm-modal-question").innerText =delete_question;
    document.getElementById("button-cancel").innerText =cancel;
    document.getElementById("button-delete").innerText =delete_;
    document.getElementById("button-cancel-newGame").innerText =cancel;
    document.getElementById("button-create").innerText =create;


    isMobile();

    loadGames();
}

/**
 * checks if the simulation runs on a mobile device
  */
function isMobile () {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        alert(mobile_alert);
    }
}

/**
 * load saved games
 */
function loadGames() {
    let games = [];
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).startsWith("game")) {
            let storageKey = localStorage.key(i);
            let game = JSON.parse(localStorage.getItem(storageKey));
            games[parseInt(game.id)] = game;
        }
    }

    for (let i = 0; i < games.length; i++) {
        if (games[i] !== undefined) {
            createGameItem(games[i]);
        }
    }
}

/**
 * create elements to visualize a saved game
 * @param game
 */
function createGameItem(game) {

    let gameWrapper = document.createElement("div");
    gameWrapper.setAttribute("id", "game-wrapper-" + game.id);
    gameWrapper.setAttribute("class", "grid-item-wrapper");

    let newGame = document.createElement("div");
    newGame.setAttribute("id", "game-" + game.id);
    newGame.setAttribute("class", "grid-item");
    newGame.setAttribute("data-clickable", "data-clickable");
    gameWrapper.appendChild(newGame);

    let deleteButton = document.createElement("button");
    deleteButton.setAttribute("class", "button delete-button");
    deleteButton.setAttribute("id", "delete-button-" + game.id);
    deleteButton.setAttribute("data-delete", "data-delete");
    deleteButton.innerText = "\u2716";
    newGame.appendChild(deleteButton);

    let gameContent = document.createElement("div");
    gameContent.setAttribute("class","game-content");

    let title = document.createElement("p");
    title.setAttribute("class", "title-sm");
    title.setAttribute("id", "title-" + game.id);
    title.setAttribute("data-clickable", "data-clickable");
    title.textContent = game.gameTitle;
    gameContent.appendChild(title);

    let progress = document.createElement("p");
    progress.setAttribute("class", "progress-sm");
    progress.setAttribute("id", "progress-" + game.id);
    progress.setAttribute("data-clickable", "data-clickable");
    progress.textContent = game.progress+" out of 7 Levels complete";
    gameContent.appendChild(progress);

    newGame.appendChild(gameContent)
    gameGrid.insertBefore(gameWrapper, gameGrid.children[games.length]);

    games.push(game);
}

function showNewGameModal() {
    //reset placeholder
    document.getElementById("game-name").value="";
    document.getElementById("dialog-modal-text").innerText=create_game_text;
    document.getElementById("game-name").setAttribute("placeholder",create_game_Placeholder);
    document.getElementById("dialog-modal").style.display = "block";
}

function createNewGame() {
    const gameName= document.getElementById("game-name");
    if (gameName.value.length === 0) {
        alert(alert_game_name);
        return;
    }
    let gameId = 0;
    // detect free id
    while(localStorage.getItem("game-" + gameId) !== null) {
        gameId++;
    }

    let game = {id: gameId, gameTitle: gameName.value, progress: 0, map: null , robots: null};
    localStorage.setItem("game-" + gameId, JSON.stringify(game));
    document.location.href = "../Level/level.html?game="+gameId+"&storyMode=1";
}

gameGrid.addEventListener('click', (event) => {
    // only detect clicks on items
    if(event.target.matches("[data-clickable]")) {

        const id = event.target.id;
        let index = id.indexOf('-');
        selectGame(parseInt(id.substring(index+1)));

    } else if(event.target.matches("[data-delete]")) {

        const id = event.target.id;
        let index = id.lastIndexOf('-');
        confirmDeleteGame(parseInt(id.substring(index+1)));
    }
});

function selectGame(id) {
    let item = null;

    // change old one
    if(selectedGame !== null) {

        item = document.getElementById("game-" + selectedGame);
        //item.style.boxShadow = "inset 0.2rem 0.2rem 0.5rem #c8d0e7, inset -0.2rem -0.2rem 0.5rem #ffffff";
        item.style.boxShadow = null;

        let deleteButton = document.getElementById("delete-button-" + selectedGame);
        if(deleteButton !== null) {
            deleteButton.style.display = "none";
        }

        // deselect map when it's clicked twice
        if(selectedGame === id) {
            selectedGame = null;

            const otherItems = document.getElementsByClassName("grid-item");
            for (let i = 0; i < otherItems.length; i++) {
                otherItems[i].style.opacity = "1";
            }

            continueButton.style.display = "none";
            return;
        }
    }

    selectedGame = id;

    item = document.getElementById("game-" + id);
    item.style.boxShadow = "0.8rem 0.8rem 0.8rem #c8d0e7, -0.4rem -0.4rem 0.9rem #ffffff";

    // show delete-button
    let deleteButton = document.getElementById("delete-button-" + id);
    if(deleteButton !== null) {
        deleteButton.style.display = "block";
    }

    // change opacity of all others
    const otherItems = document.getElementsByClassName("grid-item");
    for (let i = 0; i < otherItems.length-1; i++) {
        otherItems[i].style.opacity = "0.4";
    }

    item.style.opacity = "1";

    // show continueButton under selected experiment
    let wrapper = document.getElementById("game-wrapper-" + id);
    wrapper.appendChild(continueButton);
    continueButton.style.display = "block";
}

function confirmDeleteGame(id) {
    document.getElementById("confirm-modal").style.display = "block";
    gameToDelete = id;

    let title = games[getIndexOf(id)].gameTitle;
    document.getElementById("confirm-modal-text").innerHTML = delete_text.replace("%TITLE%",title);

}

function closeConfirmModal() {
    document.getElementById("confirm-modal").style.display = "none";
}

function closeDialogModal() {
    document.getElementById("dialog-modal").style.display = "none";
}

function deleteGame() {

    // delete from maps list
    let index = getIndexOf(gameToDelete);
    games.splice(index, 1);

    // delete from local storage
    localStorage.removeItem("game-" + gameToDelete);

    // delete div
    let gameItem = document.getElementById("game-wrapper-" + gameToDelete);
    gameItem.remove();

    // reset selected
    selectedGame = null;

    continueButton.style.display = "none";

    // reset opacity
    const otherItems = document.getElementsByClassName("grid-item");
    for (let i = 0; i < otherItems.length; i++) {
        otherItems[i].style.opacity = "1";
    }

    closeConfirmModal();
}

function continueGame() {
    // get game data
    let sGame = games[getIndexOf(selectedGame)];
    document.location.href = "../Level/level.html?game="+sGame.id+"&storyMode=1";
}

function getIndexOf(id) {
    let index = 0;
    for (let i = 0; i < games.length; i++) {
        if(games[i].id === id) {
            return index;
        }
        index++;
    }
}

init();
