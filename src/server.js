var express = require("express");
var constants = require("./constants");
var app = express();
var path = require("path");
const port = process.env.PORT || 3000;

app.use(express.json());

// temporary user variables
// TODO user accounts to store all of these
var wallet = 100.0;
var redraw = false;
var remainingCards = initCards();
var deck = [];

const winnings = [
  {
    "name": "Royal Flush",
    "value": 250,
    "process": function(deck) {
      // TODO
      return false;
    }
  },
  {
    "name": "Straight Flush",
    "value": 50,
    "process": function(deck) {
      // TODO
      return false;
    }
  },
  {
    "name": "Four Of A Kind",
    "value": 25,
    "process": function(deck) {
      var rankOccurences = countRankOccurences(deck);
      for (var i = 0; i < constants.ranks.length; i++) {
        if (rankOccurences[constants.ranks[i]] == 4) {
          return true;
        }
      }
      return false;
    }
  },
  {
    "name": "Full House",
    "value": 6,
    "process": function(deck) {
      var rankOccurences = countRankOccurences(deck);
      var foundThree = false;
      var foundTwo = false;
      for (var i = 0; i < constants.ranks.length; i++) {
        if (rankOccurences[constants.ranks[i]] == 3) {
          foundThree = true;
        }
        if (rankOccurences[constants.ranks[i]] == 2) {
          foundTwo = true;
        }
      }
      return foundThree && foundTwo;
    }
  },
  {
    "name": "Flush",
    "value": 5,
    "process": function(deck) {
      var lastSuit = deck[0].suit;
      for (var i = 1; i < deck.length; i++) {
        if (deck[i].suit != lastSuit) {
          return false;
        }
      }
      return true;
    }
  },
  {
    "name": "Straight",
    "value": 4,
    "process": function(deck) {
      // TODO
      return false;
    }
  },
  {
    "name": "Three Of A Kind",
    "value": 3,
    "process": function(deck) {
      var rankOccurences = countRankOccurences(deck);
      for (var i = 0; i < constants.ranks.length; i++) {
        if (rankOccurences[constants.ranks[i]] >= 3) {
          return true;
        }
      }
      return false;
    }
  },
  {
    "name": "Double Pair",
    "value": 2,
    "process": function(deck) {
      var rankOccurences = countRankOccurences(deck);
      var onePair = false;
      for (var i = 0; i < constants.ranks.length; i++) {
        if (rankOccurences[constants.ranks[i]] >= 2) {
          if (!onePair) {
            onePair = true;
          }
          else {
            return true;
          }
        }
      }
      return false;
    }
  },
  {
    "name": "Jacks Or Better",
    "value": 1,
    "process": function(deck) {
      var rankOccurences = countRankOccurences(deck);
      for (var i = 9; i < constants.ranks.length; i++) {
        if (rankOccurences[constants.ranks[i]] >= 2) {
          return true;
        }
      }
      return false;
    }
  }
];

// main page
app.get("/", function (req, res) {
  try {
    res.sendFile(path.join(__dirname, "..", "index.html"));
  }
  catch (e) {
    res.sendStatus(404);
  }
});

// images
app.get("/img/:rank/:suit", function (req, res) {
  try {
    res.sendFile(path.join(__dirname, "..",
                           "img",
                           req.params.rank + 
                           "_of_" + 
                           req.params.suit + 
                           ".png"));
  }
  catch (e) {
    res.sendStatus(404);
  }
});

// draw
app.post("/draw", function (req, res) {
  try {
    const bet = req.body.bet;
    if (!redraw) {
      wallet -= bet;
      drawDeck();
    }
    else {
      for (var i = 0; i < req.body.held.length; i++) {
        deck[i].held = req.body.held[i];
      }
      updateDeck();
    }
    var result = checkDeck();
    var win = {
      description: "",
      type: "none"
    }
    if (redraw) {
      if (result) {
        win.description = "Congratulations ! " + result.name;
        win.type = "win";
        wallet += bet*result.value;
      }
      else {
        win.description = "Better luck next time !";
        win.type = "loss";
      }
    }
    else if (result) {
      win.description = result.name;
      win.type = "potential";
    }
    redraw = !redraw;
    res.status(200).send({
      "deck": deck,
      "wallet": wallet,
      "bet": bet,
      "win": win
    });
  }
  catch (e) {
    res.status(500).send({
      "error": e
    });
  }
});

app.listen(port, () => {
  console.log("Poker server started on port " + port);
});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

function drawDeck() {
  remainingCards = initCards();
  deck = [];
  for (var i = 0; i < 5; i++) {
    var index = getRandomInt(remainingCards.length);
    deck.push(remainingCards[index]);
    remainingCards.splice(index, 1);
  }
}

function updateDeck() {
  for (var i = 0; i < deck.length; i++) {
    if (!deck[i].held) {
      var index = getRandomInt(remainingCards.length);
      deck[i] = remainingCards[index];
      remainingCards.splice(index, 1);
    }
  }
}

function initCards() {
  var allCards = [];
  for (var i = 0; i < constants.suits.length; i++) {
    for (var j = 0; j < constants.ranks.length; j++) {
      allCards.push({
        "suit": constants.suits[i],
        "rank": constants.ranks[j],
        "held": false
      });
    }
  }
  return allCards;
};

function checkDeck() {
  for (var i = 0; i < winnings.length; i++) {
    if (winnings[i].process(deck)) {
      return winnings[i];
    }
  }
};

function countRankOccurences(deck) {
  result = {};
  for (var i = 0; i < deck.length; i++) {
    if (!result[deck[i].rank]) {
      result[deck[i].rank] = 0;
    }
    result[deck[i].rank]++;
  }
  return result;
};


