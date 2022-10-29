/**
 * Create an HTML tag and configure it with attributes and then
 * return it.
 *
 * @param {string} tag The HTML tag to create.
 * @param {object} attributes Attributes to assign to the tag.
 * @returns {HTMLElement}
 */
const createElement = function (tag, attributes) {
    const element = document.createElement(tag);
    if (attributes) {
        Object.entries(attributes).forEach(function([key, value]) {
            element[key] = value;
        });
    }
    return element;
};

/*
 * Toggle the side navigation menu by setting its width to 250px.
 *
 */
function openSideNav() {
    if (parseInt(document.getElementById("sideBarNav").style.width) > 0) {
        closeSideNav();
        return;
    }
    document.getElementById("sideBarNav").style.width = "250px";
};

/**
 *  Close the side navigation menu.
 */
function closeSideNav() {
    document.getElementById("sideBarNav").style.width = "0";
};

/**
 * Start a new game and initialize the player data and the state of the UI.
 */
function newGame() {
    const newGameConfiguration = {
        gameType: globalGameConfiguration.gameType,
        players: [globalGameConfiguration.players[0], globalGameConfiguration.players[1]],
        strikes: [
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0]
        ],
        points: [0, 0],
        history: [
            [],
            []
        ],
        updated: true
    };
    globalGameConfiguration = newGameConfiguration;
    document.querySelectorAll(".number-button").forEach(function(numberButton) {
        updateNumberButton(numberButton, 0);
    });
    updatePlayerPoints(0);
    updatePlayerPoints(1);
    closeSideNav();
    resetAddToggle();
    saveGameConfiguration(globalGameConfiguration);
};

/**
 * Manage the state of the add or subtract toggle button.
 * @param {DOMElement} buttonElement Menu button that was clicked.
 */
function addToggle(buttonElement) {
    addOrSubtractStrikes *= -1;
    if (addOrSubtractStrikes > 0) {
        buttonElement.innerText = "Add +";
    } else {
        buttonElement.innerText = "Sub -";
    }
};

/**
 * Force the add or subtract toggle button to its initial state.
 */
function resetAddToggle() {
    const buttonElement = document.getElementById("add-button");
    addOrSubtractStrikes = 1;
    buttonElement.innerText = "Add +";
};

/**
 * show the change game pop up, allows the user to select the type of darts game to score.
 * Cricket / 301/501/?
 */
function showChangeGame() {
    closeSideNav();
};

/**
 * show the players pop-up
 */
function showPlayers() {
    closeSideNav();
};

/**
 * show a help screen
 */
function showAbout() {
    closeSideNav();
};

/**
 * Record a number strike for the player index. If the number is closed it will
 * add points to the players score.
 * @param {integer} playerIndex Which player index (0 or 1) to record a score for.
 * @param {Number} value Amount to add to players score.
 * @returns 
 */
const recordScore = function(playerIndex, value) {
    const otherPlayerIndex = playerIndex == 0 ? 1 : 0;
    let valueIndex;
    let historyEntry;
    if (value == 25) {
        valueIndex = 6;
    } else {
        valueIndex = Math.abs(parseInt(value) - 20);
    }
    if (addOrSubtractStrikes > 0) {
        historyEntry = null;
        // adding to current score
        if (globalGameConfiguration.strikes[playerIndex][valueIndex] < 3) {
            // add strikes until the number is closed
            globalGameConfiguration.strikes[playerIndex][valueIndex] += 1;
            historyEntry = value.toString() + "-" + globalGameConfiguration.strikes[playerIndex][valueIndex].toString();
        } else if (globalGameConfiguration.strikes[otherPlayerIndex][valueIndex] < 3) {
            // with number closed, and other player is not, add points to player score
            globalGameConfiguration.points[playerIndex] += value;
            historyEntry = value.toString() + "-" + globalGameConfiguration.points[playerIndex].toString();
        }
        if (historyEntry != null) {
            globalGameConfiguration.history[playerIndex].push(historyEntry);
            globalGameConfiguration.updated = true;
        }
    } else {
        // subtracting from current score only if this strike added to the score
        for (let index = globalGameConfiguration.history[playerIndex].length - 1;
            index >= 0;
            index -= 1) {
            historyEntry = globalGameConfiguration.history[playerIndex][index];
            let matched = false;
            let strikeNumber = parseInt(historyEntry);
            if (strikeNumber == value) {
                // this history entry matches the strike value
                let strikeValue = parseInt(historyEntry.substring(historyEntry.indexOf("-") + 1));
                if (strikeValue <= 3) {
                    // this history entry was used to close the number
                    globalGameConfiguration.strikes[playerIndex][valueIndex] -= 1;
                    matched = true;
                } else if (globalGameConfiguration.points[playerIndex] >= value) {
                    // this history entry was scored for points
                    globalGameConfiguration.points[playerIndex] -= value;
                    matched = true;
                }
                if (matched) {
                    // remove this entry from the players history
                    globalGameConfiguration.history[playerIndex].splice(index, 1);
                    globalGameConfiguration.updated = true;
                    break;
                }
            }
        }
    }
    return globalGameConfiguration.strikes[playerIndex][valueIndex];
};

/**
 * When a button is clicked, update the strike for the player whose turn it is.
 * @param {DOMElement} buttonElement Which button was clicked on.
 */
const numberButtonClicked = function (buttonElement) {
    const values = buttonElement.value.split(" ");
    const player = values[0];
    const value = parseInt(values[1]);
    const playerIndex = player == "left" ? 0 : 1;
    const strikes = recordScore(playerIndex, value);
    updateNumberButton(buttonElement, strikes);
    updatePlayerPoints(playerIndex);
    saveGameConfiguration(globalGameConfiguration);
};

/**
 * Update the visual state of a button to show the number of strikes.
 * @param {DOMElement} buttonElement The button to update.
 * @param {integer} strikes Number of strikes to show on the button.
 */
const updateNumberButton = function (buttonElement, strikes) {
    let newClass;

    switch (strikes) {
    case 0:
        newClass = "bg-button-open";
        break;
    case 1:
        newClass = "bg-button-strike-1";
        break;
    case 2:
        newClass = "bg-button-strike-2";
        break;
    case 3:
        newClass = "bg-button-closed";
        break;
    }
    buttonElement.classList.remove("bg-button-open", "bg-button-strike-1", "bg-button-strike-2", "bg-button-closed");
    buttonElement.classList.add(newClass);
};

/**
 * Update the player points total visual element.
 * @param {integer} playerIndex Which player index (0 or 1) to record a score for.
 */
const updatePlayerPoints = function (playerIndex) {
    let id;
    let score = globalGameConfiguration.points[playerIndex];
    if (playerIndex == 0) {
        id = "score-left";
    } else {
        id = "score-right";
    }
    const scoreElement = document.getElementById(id);
    if (scoreElement != null) {
        scoreElement.innerText = score;
    }
};

/**
 * Create a visual element to show the strike buttons and the board value.
 * @param {integer} value The dart board value to display.
 * @returns {DOMElement} The row div that should be added to a parent.
 */
const createNumberRow = function (value) {
    const sectionRoot = document.createElement("div");
    const valueString = value.toString();
    const numberClass = "number-open text-3xl font-black";

    const section = createElement("div", {
        className: "flex flex-row flex-wrap",
        innerHTML: "<button type=\"button\" class=\"bg-button-open bg-no-repeat bg-center number-button h-20 w-32 p-2 col-left\" value=\"left " + valueString + "\" onclick=\"numberButtonClicked(this)\">" + valueString + "</button><span class=\"" + numberClass + " mt-4 p-2 h-20 w-16 col-center\"> " + valueString + " </span><button type=\"button\" class=\"bg-button-open bg-no-repeat bg-center number-button h-20 w-32 p-2 col-right\" value=\"right " + valueString + "\" onclick=\"numberButtonClicked(this)\">" + valueString + "</button>"
    });
    sectionRoot.appendChild(section);
    return sectionRoot;
};

/**
 * Create the row that will show the player points scores.
 * @returns {DOMElement} The score row div that should be added to a parent.
 */
const createScoreRow = function () {
    const sectionRoot = document.createElement("div");
    const className = "text-green-700 text-5xl font-black align-middle";
    const leftScore = 0;
    const rightScore = 0;
  
    const section = createElement("div", {
        className: "flex flex-row flex-wrap",
        innerHTML: "<span id=\"score-left\" class=\"" + className + " p-2 w-32 text-center col-left\">" + leftScore.toString() + "</span><span class=\"p-2 w-16 text-center col-center\"> score </span><span id=\"score-right\" class=\"" + className + " p-2 w-32 text-center col-right\">" + rightScore.toString() + "</span>"
    });
    sectionRoot.appendChild(section);
    return sectionRoot;
};

/**
 * Create a visual element to show the player names.
 * @param {object} gameConfiguration Game configuration data
 * @returns {DOMElement} The player row div that should be added to a parent.
 */
const createPlayerRow = function (gameConfiguration) {
    const sectionRoot = document.createElement("div");
    const className = "player";
    const leftName = gameConfiguration.players[0];
    const rightName = gameConfiguration.players[1];
  
    const section = createElement("div", {
        className: "flex flex-row flex-wrap",
        innerHTML: "<span class=\"" + className + " p-2 w-32 text-2xl font-black col-left\">" + leftName + "</span><span class=\"" + className + " p-2 w-16 col-center\"> </span><span class=\"" + className + " p-2 w-32 text-2xl font-black col-right\">" + rightName + "</span>"
    });
    sectionRoot.appendChild(section);
    return sectionRoot;
};

/**
 * Set the state of the UI to show the type of game being played.
 * @param {object} gameConfiguration Current game configuration data.
 */
const setGameType = function(gameConfiguration) {
    const gameTypeElement = document.getElementById("game-type");
    gameTypeElement.innerText = gameConfiguration.gameType;
}

/**
 * Load the game configuration, any prior game data.
 */
const loadConfiguration = async function () {
    const serializedData = window.localStorage.getItem("darts-score-tracker");
    if (serializedData != null) {
        gameConfiguration = JSON.parse(serializedData);
        if (gameConfiguration != null) {
            return gameConfiguration;
        }
    }

    return gameConfiguration = {
        gameType: "Cricket",
        players: ["Player 1", "Player 2"],
        strikes: [
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0]
        ],
        points: [0, 0],
        history: [
            [],
            []
        ],
        updated: true
    }
};

/**
 * Save the current game configuration to local storage such that it can be later
 * restored. Saving is tracked by the time last save and if there are any changes
 * to save so that we don't do unnecessary writes when not needed.
 * @param {object} gameConfiguration Current game configuration data.
 */
function saveGameConfiguration(gameConfiguration) {
    const timeNow = Date.now();
    if (gameConfiguration.updated && (timeNow - lastSave) > 2000) {
        gameConfiguration.updated = false;
        const serializedData = JSON.stringify(gameConfiguration);
        window.localStorage.setItem("darts-score-tracker", serializedData);
        lastSave = timeNow;
    }
};

/**
 * Build the UI for a Cricket game board.
 * @param {object} gameConfiguration Current game configuration data.
 */
const buildCricketGameBoard = function(gameConfiguration) {
    const mainSection = document.getElementById("main");
    let section;
    let value;
    let index;

    section = createPlayerRow(gameConfiguration);
    mainSection.append(section);

    for (value = 20, index = 0; value >= 15; value -= 1, index += 1) {
        section = createNumberRow(value);
        mainSection.append(section);
        gameConfiguration.strikes[0][index] = 0;
        gameConfiguration.strikes[1][index] = 0;
    }
    section = createNumberRow(25);
    mainSection.append(section);
    gameConfiguration.strikes[0][index] = 0;
    gameConfiguration.strikes[1][index] = 0;

    section = createScoreRow();
    mainSection.append(section);
    gameConfiguration.points[0] = 0;
    gameConfiguration.points[1] = 0;
};

/**
 * Start the app.
 */
const main = async function () {
    let gameConfiguration = await loadConfiguration();

    setGameType(gameConfiguration);
    buildCricketGameBoard(gameConfiguration);
    globalGameConfiguration = gameConfiguration;
};

let globalGameConfiguration;
let lastSave = Date.now();
let addOrSubtractStrikes = 1; // 1 to add, -1 to subtract
main();
