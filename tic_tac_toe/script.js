// Variables and click functionality.
var origBoard;
var huPlayer = "O";
var aiPlayer = "X";
//  document.querySelector(".endgame .text").innerText = "Please select 'X' or 'Y'!";
$(document).ready(function() {
  $(".checkBox").click(function() {
    if($(this).is(":checked")) {
      huPlayer = $(this).val();
      aiPlayer = huPlayer == "X" ? "O" : "X";
      // If huPlayer selects 'X'then aiPlayer is assigned 'O'.
      // If huPlayer selects 'O'then aiPlayer is assigned 'X'.
    }
  });
});
// Winning combinations is an array of arrays.
const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [6, 4, 2]
];

// cells variable will store a reference to the 'td class cell' elements.
const cells = document.querySelectorAll(".cell");
startGame();

// startGame function will run at the beginning of the session and when 'Rematch?' button is clicked.
function startGame() {
  // Hide the 'Rematch?' button.
  $(document).ready(function() {
    $("#replay").hide();
  });
  document.querySelector(".endgame").style.display = "none"; // Reset 'endgame' game board at Rematch?.
  origBoard = Array.from(Array(9).keys()); // Makes Array of 9 elements, every number 0-8.
  // console.log(origBoard); working.
  for (var i = 0; i < cells.length; i++) {
    // Cells is a reference to every cell in: const cells.
    cells[i].innerText = ""; // Assign empty space to each element in the origBoard array removing any "X's" or "O's".
    cells[i].style.removeProperty("background-color"); // Remove any previous game color from cells.
    cells[i].addEventListener("click", turnClick, false); // Run 'turnClick' function when cell is clicked.
  }
}

function turnClick(square) {
  // Square passes in the click event from: cells[i].addEventListner().
  if (typeof origBoard[square.target.id] == "number") {
    // Check if square has been played.
    // Checks square id: if it has an index number, square has not been played; if '0' or 'X', square has been played.
    turn(square.target.id, huPlayer); // Calls 'turn' function and passes the 'id'.
    // human player takes a turn by clicking a square and calls the 'turn' function.
    if (!checkWin(origBoard, huPlayer) && !checkTie())
      turn(bestSpot(), aiPlayer);
  }
}

function turn(squareId, player) {
  // 'Turn function is called by both huPayer and aiPlayer.
  origBoard[squareId] = player; // Records the square the player clicks.
  document.getElementById(squareId).innerText = player; // Players move is updated on the new origBoard.
  // Logic to determine winner and winning combination.
  let gameWon = checkWin(origBoard, player); // Passes updated borad and current player.
  if (gameWon) gameOver(gameWon); // If gameWon, call gameOver function passing the gameWon variable.
}

function checkWin(board, player) {
  let plays = board.reduce(
    (a, e, i) => (e === player ? a.concat(i) : a),
    []
  ); /* Reduce method tracks all the squares 
  on the board that have been played and will give back a single value 'a', the accumulator. The accumulator is 
  initialized with an empy array '[]'. 'e' is the element in the board array, and 'i' is the index of the square 
  of the board array. If 'e' is equal to player, concatinate 'i' or the index to the accumulator array. If 'e' 
  is not equal to player, return the accumulaor unchanged. This finds every index square the player has played 
  in. '?' is a turn area operator 'then'.*/
  let gameWon = null;
  for (let [index, win] of winCombos.entries()) {
    // winCombos.entries gets the index and the win combination from const winCombos array used in for loop.
    if (win.every(elem => plays.indexOf(elem) > -1)) {
      /* win.every is every element in the win array. Plays is from the reduction function above. The index of the element 
      is > -1. Has the player played in every square that counts as a win in the win array (=> read as has) For every 
      element in the win array has every square been played. */
      gameWon = { index: index, player: player };
      // If no body wins, gameWon = null; if game is won, gameWon will contain which winCombo index and which player won.
      break;
    }
  }
  return gameWon;
}

function gameOver(gameWon) {
  for (let index of winCombos[gameWon.index]) {
    // Pass through the indexes of the winning combination.
    document.getElementById(index).style.backgroundColor =
      gameWon.player == huPlayer ? "blue" : "red"; // Set for huPlayer background-color to win or loss.
    // Highlights the winning combination of squares.
  }
  for (var i = 0; i < cells.length; i++) {
    cells[i].removeEventListener("click", turnClick, false);
    // Prevents user from clicking anymore squares because the game is over.
  }
  declareWinner(gameWon.player == huPlayer ? "You Win!" : "You Lose!");
  // Uses function declareWinner(who) to define winner.
  $(document).ready(function() {
    $("#replay").show();
  });
}

// Basic AI and winner notification.
function declareWinner(who) {
  // receices the "Tie Game!" passed from 'declareWinner ' or "You Win!", "You Lose" from
  // the "gameOver" function.
  document.querySelector(".endgame").style.display = "block";
  document.querySelector(".endgame .text").innerText = who;
  // Sets the HTML endgame.text to 'who': "You Win!", "You Lose", or "Tie Game!".
}

function emptySquares() {
  return origBoard.filter(s => typeof s == "number");
  // Filters every element in the origBoard array to see if the square is a number, then returns that number index.
}
// This function was used with basic ai.
/*function bestSpot() {
  return emptySquares()[0];
  // Runs emptySquares function to get the lowest available square index in the returned array.
}*/

function bestSpot() {
  return minimax(origBoard, aiPlayer).index; // Returns the result of calling the 'minimax' function passing origBoard and
  // aiPlayer object dot index.
}

function checkTie() {
  if (emptySquares().length == 0) {
    // If emptySquares length is 0, the array of all squares have been played and has no winner.
    for (var i = 0; i < cells.length; i++) {
      cells[i].style.backgroundColor = "green";
      cells[i].removeEventListener("click", turnClick, false); // User can no longer click a square.
    }
    declareWinner("Tie Game!"); // calls the 'declareWinner' function.
    $(document).ready(function() {
      $("#replay").show();
    });
    return true; // If statement is true.
  }
  return false; // Else, return false.
}

// Minimax algorithm AI!
function minimax(newBoard, player) {
  // Player will be huPlayer or aiPlayer on each turn.
  var availSpots = emptySquares(newBoard); // Locate indexes of available squares using the 'emptySquares' function.
  // Check for winner.
  if (checkWin(newBoard, huPlayer)) {
    return { score: -10 }; // If 'O' wins return -10.
  } else if (checkWin(newBoard, aiPlayer)) {
    return { score: 10 }; // If 'X' wins return +10.
  } else if (availSpots.length === 0) {
    return { score: 0 }; // If availSpots.length is '0', game is a tie and return '0'.
  }
  /* Collect the scores of each of the empty spots in array "moves" using a for loop, and save the index and score
    in object 'move'.*/
  var moves = [];
  for (var i = 0; i < availSpots.length; i++) {
    var move = {};
    move.index = newBoard[availSpots[i]]; // Set index number of the empty spot that was stored as a number in the origBoard
    // to the index property of the move object.
    newBoard[availSpots[i]] = player; // Set the empty spot on the newBoard to the current player.

    if (player == aiPlayer) {
      // Call the minimax function on the other player and the newly changed newBoard.
      var result = minimax(newBoard, huPlayer);
      move.score = result.score; // Store the object from the minimax function call that includes a score
      // property to the score property of the move object.
    } else {
      /* If the minimax function does not find a terminal state, it continues testing level by level deeper into the game.
      This recursion continues until a terminal state is found and returns a score one level up. Finally minimax resets
      the nuwBoard as it was and pushes the new move object, to the moves array. */
      var result = minimax(newBoard, aiPlayer);
      move.score = result.score;
    }
    newBoard[availSpots[i]] = move.index;
    moves.push(move);
  }
  var bestMove; // Evaluates the best move in the moves array.
  if (player === aiPlayer) {
    // Minimax chooses the move with the highest score when the aiPlayer is playing,
    // the move with the lowest score when the huPlayer is playing.
    var bestScore = -10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        // If the index of moves object is higher than bestScore it is saved in bestScore.
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    var bestScore = 10000;
    for (var i = 0; i < moves.length; i++) {
      // If the index of moves object is lower than bestScore it is saved in
      // bestScore.
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove]; // Minimax returns the object stored in bestMove.
}