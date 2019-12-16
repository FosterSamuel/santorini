// Game states
const SETTING_FIRST_WORKER = 0,
	  SETTING_SECOND_WORKER = 1,
	  CHOOSING_WORKER = 2,
	  MOVING_WORKER = 3,
	  BUILDING = 4,
	  WON = 5;

// Buildings
const GROUND 	  = 0,
	  FIRST_LEVEL = 1,
	  SECOND_LEVEL= 2,
	  THIRD_LEVEL = 3,
	  DOME		  = 4;

function startGame() {
	const GAME = {
		board: newBoard(),
		state: SETTING_FIRST_WORKER,
		nextMove: "",
		moves: [],
		playNotation: null,
		playPosition: playPosition,
		playerTurn: 0,
		selectedWorker: -1,
		workerOne: [-1, -1],
		workerTwo: [-1, -1],
		workerThree: [-1, -1],
		workerFour: [-1, -1]
	};

	return GAME;
}

function newBoard() {
	return [[0, 0, 0, 0, 0],  // Row 4
		    [0, 0, 0, 0, 0],  // Row 3
		    [0, 0, 0, 0, 0],  // Row 2
		    [0, 0, 0, 0, 0],  // Row 1
		    [0, 0, 0, 0, 0]]; // Row 0
}


async function playPosition(row, column) {
	const playerTurn = this.playerTurn;
	let w1 = playerTurn == 0 ? this.workerOne : this.workerThree;
	let w2 = playerTurn == 0 ? this.workerTwo : this.workerFour;
	const w3 = playerTurn == 0 ? this.workerThree : this.workerOne;
	const w4 = playerTurn == 0 ? this.workerFour : this.workerTwo;
	const selectedWorker = this.selectedWorker;
	const selectedW = this.selectedWorker == 1 ? w2 : w1;

	if(moveOutsideBoard(row, column)) {
		console.log("illegal move");
		// TODO: replace with error message
		return false;
	} 

	switch(this.state) {
		case SETTING_FIRST_WORKER:
			if(samePosition(row, column, w3)) {
				console.log("illegal move -- worker already there");
				// TODO: replace with error message
				break;
			}

			if(playerTurn == 0) {
				this.workerOne = [row, column];
			} else {
				this.workerThree = [row, column];
			}
			console.log("Set first worker");
			if(this.moves.length == 0) {
				this.moves.push({
					move: SETTING_FIRST_WORKER,
					notatedMove: getNotation(row, column),
					build: -1,
					row: row,
					column: column
				});
			} else {
				const lastMove = this.moves.pop();
				lastMove.notatedMove += "-" + getNotation(row, column);
				this.moves.push(lastMove);
			}
			if(this.playerTurn == 0) {
				this.playerTurn = 1;
				this.state = SETTING_FIRST_WORKER;
			} else {
				this.playerTurn = 0;
				this.state = SETTING_SECOND_WORKER;
			}
			break;
		case SETTING_SECOND_WORKER:
			if (samePosition(row, column, w1) ||
				samePosition(row, column, w3) ||
				samePosition(row, column, w4)) {
				console.log("illegal move -- worker already there");
				// TODO: replace with error message
				break;
			} 

			if(playerTurn == 0) {
				this.workerTwo = [row, column];
			} else {
				this.workerFour = [row, column];
			}
			console.log("Set second worker");
			const lastMove = this.moves.pop();
			lastMove.notatedMove += "-" + getNotation(row, column);
			this.moves.push(lastMove);

			if(this.playerTurn == 0) {
				this.playerTurn = 1;
			} else {
				this.playerTurn = 0;
				this.state = CHOOSING_WORKER;
			}
			break;
		case CHOOSING_WORKER:
			if(samePosition(row, column, w1)) {
				this.selectedWorker = 0;
			} else if (samePosition(row, column, w2)) {
				this.selectedWorker = 1;
			} else {
				this.selectedWorker = -1;
				console.log("No worker selected");
				// TODO: replace with error message
			}

			if (this.selectedWorker > -1) {
				console.log(this.selectedWorker + " selected");
				this.state = MOVING_WORKER;
			}

			break;
		case MOVING_WORKER:
			console.log("Attempting move of " + this.selectedWorker);
			// Can't move on top of a worker
			if(samePosition(row, column, w1)) {
				console.log("Can't move on top of first worker");
				break; // TODO: replace with error message
			} else if (samePosition(row, column, w2)) {
				console.log("Can't move on top of second worker");
				break; // TODO: replace with error message
			} else if (samePosition(row, column, w3)) {
				console.log("Can't move on top of third worker");
				break; // TODO: replace with error message
			} else if (samePosition(row, column, w4)) {
				console.log("Can't move on top of fourth worker");
				break; // TODO: replace with error message
			}

			// Position must be adjacent
			if(withinReach(row, column, selectedW)) {
				const attemptedLevel = this.board[4 - row][column];
				if(attemptedLevel == 4) {
					console.log("Can't move on to dome");
					break; // TODO: replace with error message
				}

				const workerRow = selectedW[0];
				const workerColumn = selectedW[1];
				const currentLevel = this.board[4 - workerRow][workerColumn];
				if(attemptedLevel - currentLevel <= 1) {
					if(playerTurn == 0) {
						if(selectedWorker == 0) {						
							this.workerOne[0] = row;
							this.workerOne[1] = column;	
						} else {
							this.workerTwo[0] = row;
							this.workerTwo[1] = column;	
						}
					} else {
						if(selectedWorker == 0) {						
							this.workerThree[0] = row;
							this.workerThree[1] = column;	
						} else {
							this.workerFour[0] = row;
							this.workerFour[1] = column;	
						}
					}
					const moveNotation = getNotation(row, column);
					this.moves.push({
						move: MOVING_WORKER,
						notatedMove: (selectedWorker == 1 ? moveNotation.toUpperCase() : moveNotation),
						build: -1,
						row: row,
						column: column
					});


					if(attemptedLevel == 3) {
						this.state = WON;
						console.log("Congrats! You win.")
					}
					this.state = BUILDING;
				}
			}
			break;
		case BUILDING:
			// Can't build on top of a worker
			if(samePosition(row, column, w1)) {
				break; // TODO: replace with error message
			} else if (samePosition(row, column, w2)) {
				break; // TODO: replace with error message
			} else if (samePosition(row, column, w3)) {
				break; // TODO: replace with error message
			} else if (samePosition(row, column, w4)) {
				break; // TODO: replace with error message
			}

			const currentLevel = this.board[4 - row][column];
			// Can't build on top of dome
			if(currentLevel == 4) {
				break; // TODO: replace with error message
			}

			if(!withinReach(row, column, selectedW)) {
				console.log("Must build adjacent to selected worker");
				console.log("Worker: " + selectedW);
				console.log("Row, column: " + row + ", " + column);
				break; // TODO: replace with error message
			} else {
				this.board[4 - row][column] = currentLevel + 1;
				
				const lastMove = this.moves.pop();
				lastMove.move = BUILDING;
				lastMove.build = getBuildNotation(currentLevel + 1, row, column);
				lastMove.row = row;
				lastMove.column = column;
				this.moves.push(lastMove);

				this.playerTurn = playerTurn == 0 ? 1 : 0;
				this.state = CHOOSING_WORKER;
			}
			break;
	}

	return true;
}

function samePosition(row, column, set) {
	return set[0] == row && set[1] == column;
}

function withinReach(row, column, worker) {
	const rowDiff = Math.abs(row - worker[0]);
	const columnDiff = Math.abs(column - worker[1]);

	return rowDiff < 2 && columnDiff < 2;
}

function moveOutsideBoard(row, column) {
	return (row < 0 || row > 4) || (column < 0 || column > 4);
}

function getNotation(row, column) {
	return ['a','b','c','d','e'][column] + [1, 2, 3, 4, 5][row];
}

function getBuildNotation(piece, row, column) {
	if(piece == 1) return getNotation(row, column);
	return piece + getNotation(row, column);
}