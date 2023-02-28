window.onload = async () => {
    // First clicking start button
    start.onclick = async function() { await startGame(); }
    
    // Initiate best guess from local storage to window
    // localStorage reference: https://www.w3schools.com/jsref/prop_win_localstorage.asp
    if (localStorage.getItem("bestHeartsGuess") !== null) {
        heartsGuess.innerHTML = localStorage.getItem("bestHeartsGuess");
    } else { heartsGuess.innerHTML = "0"; }
    if (localStorage.getItem("bestFullGuess") !== null) {
        fullGuess.innerHTML = localStorage.getItem("bestFullGuess");
    } else { fullGuess.innerHTML = "0"; }
    
    // Initiate best score from local storage to window
    if (localStorage.getItem("bestHeartsScore") !== null) {
        heartsScore.innerHTML = localStorage.getItem("bestHeartsScore");
    } else { heartsScore.innerHTML = "0"; }
    if (localStorage.getItem("bestFullScore") !== null) {
        fullScore.innerHTML = localStorage.getItem("bestFullScore");
    } else { fullScore.innerHTML = "0"; } 

    // Initiate recorded time from local storage to window
    if (localStorage.getItem("bestHeartsTime") !== null) {
        bestHeartsTime.innerHTML = localStorage.getItem("bestHeartsTime");
    } else { bestHeartsTime.innerHTML = "N/A"; } 
    if (localStorage.getItem("bestFullTime") !== null) {
        bestFullTime.innerHTML = localStorage.getItem("bestFullTime");
    } else { bestFullTime.innerHTML = "N/A"; } 

}

const startGame = async function() {
    // Load selected deck on window
    var selectedDeck = "";
    var gameSuit = "";
    if (pickHearts.checked) {
        selectedDeck = await getHearts();
        gameSuit = "hearts";
        // Initiate setup of entire game
        initiateGame(selectedDeck, gameSuit);
    } else if (pickFull.checked) {
        selectedDeck = await getFull();
        gameSuit = "full";
        // Initiate setup of entire game
        initiateGame(selectedDeck, gameSuit);
    } else { alert("Please choose a deck to play.")}
}

const initiateGame = async function(selectedDeck, gameSuit) {
    //console.log(selectedDeck, gameSuit);    // Check if deck and suit are correct

    // Initiate a card, guess, and score
    var cards = await nextCard(selectedDeck);
    var aCard = cards[0];
    var guess = 0;
    var cardDrawn = [Number(aCard.value)];
    //console.log(cardDrawn);
    var score = 0;

    // Show display of game card and buttons after clicked start button
    buttons.style.display = "block";
    card.style.display = "block";

    // When clicking higher button
    higher.onclick = async function() {
        // Draw next card
        var nCards = await nextCard(selectedDeck);
        var nCard = nCards[0];
        var remain = nCards[1];
        var rates = await getHints(gameSuit, cardDrawn, aCard);
        
        // Compare two cards
        if (Number(nCard.value) > Number(aCard.value)) {
            guess += 1;     // Correct: guess + 1
            aCard = nCard;  // Store current card to previous card
            score += 101 - rates[0];     // Correct: + score

            // When cards used up
            if (remain == 0) { endGame("win", guess, gameSuit, score); }
        }
        else { endGame("lose", guess, gameSuit, score); }    // Incorrect

        // Get the drawn card value
        cardDrawn.push(Number(aCard.value));
    }

    // When clicking lower button
    lower.onclick = async function() {
        // Draw next card
        var nCards = await nextCard(selectedDeck);
        var nCard = nCards[0];
        var remain = nCards[1];
        var rates = await getHints(gameSuit, cardDrawn, aCard);
        
        // Compare two cards
        if (Number(nCard.value) < Number(aCard.value)) {
            guess += 1;     // Correct: guess + 1
            aCard = nCard;  // Store current card to previous card
            score += 101 - rates[1];     // Correct: + score

            // When cards used up
            if (remain == 0) { endGame("win", guess, gameSuit, score); }
        }
        else { endGame("lose", guess, gameSuit, score); }    // Incorrect

        // Get the drawn card value
        cardDrawn.push(Number(aCard.value));
    }

    // When clicking skip button
    skip.onclick = async function() {
        // Draw next card
        var nCards = await nextCard(selectedDeck);
        var nCard = nCards[0];
        var remain = nCards[1];
        
        // Without comparing cards, adding guess and losing game
        aCard = nCard;  // Store current card to previous card
        // When cards used up
        if (remain == 0) { endGame("win", guess, gameSuit, score); }

        // Get the drawn card value
        cardDrawn.push(Number(aCard.value));
    }

    // When clicking hint button
    hint.onclick = async function() {
        // Show likelihood of next card to users with an alert
        var hints = await getHints(gameSuit, cardDrawn, aCard);
        alert("The likelihood of next card being...\nHigher: " + hints[0] + "%\nLower: "+ hints[1] + "%")
    }

    // Switch start button to quit button
    start.innerHTML = "Quit";
    start.id = "quit";
    // When clicking quit button
    quit.onclick = async function() { endGame("quit", guess, gameSuit, score); }    
}

const getHearts = async function() {
    // Get a deck of cards (only Hearts suit) as a json object
    let dat = "";
    try {
        let response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?cards=AH,2H,3H,4H,5H,6H,7H,8H,9H,0H,JH,QH,KH")
        // Smaller deck for testing
        //let response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?cards=AH,2H,3H")
        dat = await response.json();
        //console.log("hearts", dat);
    }
    // Print a message to console log if something goes wrong
    catch (err) { console.log("error", err); }
    finally { return dat }
}

const getFull = async function() {
    // Get a deck of cards (Full suit) as a json object
    let dat = "";
    try {
        let response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/")
        // Smaller deck for testing
        //let response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?cards=AH,2H,3H")
        dat = await response.json();
        //console.log("full", dat);
    }
    // Print a message to console log if something goes wrong
    catch (err) { console.log("error", err); }
    finally { return dat }
}

const drawCard = async function(deck_id) {
    // Draw a card from the deck selected
    let dat = "";
    try {
        let response = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=1`)
        dat = await response.json();
        //console.log("getCard", dat);
    }
    // Print a message to console log if something goes wrong
    catch (err) { console.log("error", err); }
    finally { return dat }
}

const showCard = function(card) {
    // Change image source to current card
    document.getElementById("card").src = `https://deckofcardsapi.com/static/img/${card.code}.png`;
}

const cardValue = async function(card) {
    // Convert non-numeric card value to comparable number
    if (card.value == "ACE") { card.value = 1; }
    if (card.value == "JACK") { card.value = 11; }
    if (card.value == "QUEEN") { card.value = 12; }
    if (card.value == "KING") { card.value = 13; }
    //console.log(card.value);
}

const nextCard = async function(suite) {
    // Draw next card
    var cards = await drawCard(suite.deck_id);
    var aCard = cards.cards[0];
    var remain = cards.remaining;
    //console.log(cards, aCard);

    showCard(aCard);
    cardValue(aCard);
    return [aCard, remain];
}

const endGame = function(type, guess, gameSuit, score) {
    // Determine win / lose / quit of the game
    if (type == "win") {
        alert("Congratulations!\nYou won the game with full correct guess = " + guess + ".");
    } else if (type == "lose") {
        alert("Sorry, you lost.\nYou have " + guess + " correct guess.");
    } else if (type == "quit") {
        alert("See you and play again soon!\nYou ended the game with correct guess = " + guess + ".");
    }

    // Get previous best guess and score of current game suit, and update guess and score
    if (gameSuit == "hearts") {
        var previousBest = heartsGuess.innerHTML;
        var previousBestScore = heartsScore.innerHTML;
    } else if (gameSuit == "full") {
        var previousBest = fullGuess.innerHTML;
        var previousBestScore = fullScore.innerHTML;
    }
    updateGS(guess, previousBest, gameSuit, score, previousBestScore);

    // Switch quit button to start button
    quit.innerHTML = "Start";
    quit.id = "start";
    // When clicking start button
    start.onclick = async function() { await startGame(); }

    // Hide display of game card and buttons after end game
    buttons.style.display = "none";
    card.style.display = "none";
}

const updateGS = function(guess, bestGuess, gameSuit, score, bestScore) {
    // Get current date and time, append a dummy zero for a single digit
    let appendZero = function(i) {
        if (i < 10) { i = "0" + i }
        return i;
    }
    // Date object reference: https://www.w3schools.com/jsref/jsref_obj_date.asp
    let d = new Date();
    let year = d.getFullYear();
    let month = appendZero(d.getMonth() + 1);
    let date = appendZero(d.getDate());
    let hour = appendZero(d.getHours());
    let minute = appendZero(d.getMinutes());
    let second = appendZero(d.getSeconds());
    let time = year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
    
    // Update best guess if current guess > previous best guess
    if (guess > bestGuess) {
        bestGuess = guess;
        if (gameSuit == "hearts") {
            localStorage.setItem("bestHeartsGuess", bestGuess);
            heartsGuess.innerHTML = localStorage.getItem("bestHeartsGuess");
            localStorage.setItem("bestHeartsTime", time);
            bestHeartsTime.innerHTML = localStorage.getItem("bestHeartsTime");
        } else if (gameSuit == "full") {
            localStorage.setItem("bestFullGuess", bestGuess);
            fullGuess.innerHTML = localStorage.getItem("bestFullGuess");
            localStorage.setItem("bestFullTime", time);
            bestFullTime.innerHTML = localStorage.getItem("bestFullTime");
        }
    }
    // Update best score if current score > previous best score
    if (score > bestScore) {
        bestScore = score;
        if (gameSuit == "hearts") {
            localStorage.setItem("bestHeartsScore", bestScore);
            heartsScore.innerHTML = localStorage.getItem("bestHeartsScore");
            localStorage.setItem("bestHeartsTime", time);
            bestHeartsTime.innerHTML = localStorage.getItem("bestHeartsTime");
        } else if (gameSuit == "full") {
            localStorage.setItem("bestFullScore", bestScore);
            fullScore.innerHTML = localStorage.getItem("bestFullScore");
            localStorage.setItem("bestFullTime", time);
            bestFullTime.innerHTML = localStorage.getItem("bestFullTime");
        }
    }
}

clear.onclick = function() {
    // Clear all records of best score and guess from local storage, and return initial value
    localStorage.clear();
    heartsGuess.innerHTML = 0;
    fullGuess.innerHTML = 0;
    heartsScore.innerHTML = 0;
    fullScore.innerHTML = 0;
    bestHeartsTime.innerHTML = "N/A";
    bestFullTime.innerHTML = "N/A";
}

// Show likelihood of next card to users with an alert
const getHints = async function(gameSuit, cardDrawn, aCard) {
    // Initiate value 1 - 13 of a suit
    var deck = [];
    for (let i = 1; i <= 13; i++) {
        deck.push(i);
    }
    // Repeat 4 times for value 1 - 13 to get a full deck
    if (gameSuit == "hearts") {
        deck = deck;
    } else if (gameSuit == "full") {
        deck = deck.concat(deck, deck, deck);
    }
    const n = deck.length;
    
    // Remove drawn card from the deck
    for (let i = 0; i < cardDrawn.length; i++) {
        var drawn = cardDrawn[i];
        var deckPos = deck.indexOf(drawn);
        deck.splice(deckPos, 1);
     }
    //console.log(deck);

    // Count number of remaining cards that are higher / lower than current card
    var higher = 0;
    var lower = 0;
    for (let i = 0; i < deck.length; i++) {
        if (deck[i] > aCard.value) {
            higher += 1;
        } else if (deck[i] < aCard.value) {
            lower += 1;
        }
    }
    //console.log(higher, lower)

    // Calculate the rate (likelihood) of next card being higher / lower than current card
    var higherRate = Math.round(higher / (n - cardDrawn.length) * 100);
    var lowerRate = Math.round(lower / (n - cardDrawn.length) * 100);
    //console.log(higherRate, lowerRate);

    return [higherRate, lowerRate];
}