# santorini

A WebRTC-based version of the board game with the same name. Instead of a signalling server, invitation/response codes are generated to start the game. [Play now](https://fostersamuel.github.io/santorini)

## Game logic

The entire game logic is stored in `game.js`. Call `createNewGame()` and store it:

```js
const santoriniGame = startGame();
```

To play the game, call `playPosition` with a row and column:
```js
santoriniGame.playPosition(0, 2);
```

The board is five rows and five columns, arranged like this:
```js
[[0, 0, 0, 0, 0],  // Row 0
 [0, 0, 0, 0, 0],  // Row 1
 [0, 0, 0, 0, 0],  // Row 2
 [0, 0, 0, 0, 0],  // Row 3
 [0, 0, 0, 0, 0]]; // Row 4
//Col 0
//   Col 1
//      Col 2
//         Col 3
//    	      Col 4
```


The game object will keep track of the board state, legal moves, and more. For example:
```js
const allMovesFromGame = santoriniGame.moves; // Notated array of moves
const secondPlayerFirstWorkerPosition = santoriniGame.secondPlayerFirstWorker; // Array of row and column position of this worker

const whatPositionsShouldBeHighlightedForNextTurn = santoriniGame.legalBuildsForNextTurn; // Array of row/column pairs that are legal for the next turn

const whichPlayerWon = santoriniGame.winningPlayer; // 0 = player one, 1 = player two

const whoseTurnIsIt = santoriniGame.playerturn; // 0 = player one, 1 = player two

const whichWorkerDidTheCurrentPlayerSelect = santoriniGame.selectedWorker; // 0 = first worker, 1 = second worker
```

For a full list of what is available in the game object, see [`game.js`.](/js/game.js)
