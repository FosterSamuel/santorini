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
		lastBuild: null,
		lastMove: null,
		legal: {
			workerOne: [],
			workerTwo: [],
			workerThree: [],
			workerFour: []
		},
		legalMoves: [],
		legalBuilds: [],
		listLegalMoves: listLegalMoves,
		listLegalBuilds: listLegalBuilds,
		moves: [],
		nextMove: "",
		playNotation: null,
		playPosition: playPosition,
		playerTurn: 0,
		selectedWorker: -1,
		winningPlayer: -1,
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

function listLegalBuilds() {
	this.legalBuilds = [];

	const findLegalBuilds = determineLegalBuilds.bind(this);

	this.legal.workerOne = findLegalBuilds(this.workerOne);
	this.legal.workerTwo = findLegalBuilds(this.workerTwo);
	this.legal.workerThree = findLegalBuilds(this.workerThree);
	this.legal.workerFour = findLegalBuilds(this.workerFour);

	if(this.playerTurn == 0) {
		if(this.selectedWorker == 0) {
			this.legalBuilds = this.legal.workerOne;
		} else {
			this.legalBuilds = this.legal.workerTwo;
		}
	} else {
		if(this.selectedWorker == 0) {
			this.legalBuilds = this.legal.workerThree;
		} else {
			this.legalBuilds = this.legal.workerFour;
		}
	}

	console.log("Found legal builds: ");
	console.log(this.legalBuilds);
}

function determineLegalBuilds(worker) {
	const builds = [];
	const row = worker[0];
	const column = worker[1];
	const workerLevel = this.board[4 - row][column];

	const isLegal = isBuildLegal.bind(this);
	
	// Check up
	if(isLegal(worker, workerLevel, row + 1, column)) {
		builds.push([row + 1, column]);
	}

	// Check diag right up
	if(isLegal(worker, workerLevel, row + 1, column + 1)) {
		builds.push([row + 1, column + 1]);
	}

	// Check right
	if(isLegal(worker, workerLevel, row, column + 1)) {
		builds.push([row, column + 1]);
	}
	// Check diag right down
	if(isLegal(worker, workerLevel, row - 1, column + 1)) {
		builds.push([row - 1, column + 1]);
	}
	// Check down
	if(isLegal(worker, workerLevel, row - 1, column)) {
		builds.push([row - 1, column]);
	}
	// Check diag left down
	if(isLegal(worker, workerLevel, row - 1, column - 1)) {
		builds.push([row - 1, column - 1]);
	}
	// Check left
	if(isLegal(worker, workerLevel, row, column - 1)) {
		builds.push([row, column - 1]);
	}
	// Check diag left up
	if(isLegal(worker, workerLevel, row + 1, column - 1)) {
		builds.push([row + 1, column - 1]);
	}

	return builds;
}

function listLegalMoves() {
	this.legalMoves = [];

	const findLegalMoves = determineLegalMoves.bind(this);

	this.legal.workerOne = findLegalMoves(this.workerOne);
	this.legal.workerTwo = findLegalMoves(this.workerTwo);
	this.legal.workerThree = findLegalMoves(this.workerThree);
	this.legal.workerFour = findLegalMoves(this.workerFour);

	if(this.playerTurn == 0) {
		if(this.selectedWorker == 0) {
			this.legalMoves = this.legal.workerOne;
		} else {
			this.legalMoves = this.legal.workerTwo;
		}
	} else {
		if(this.selectedWorker == 0) {
			this.legalMoves = this.legal.workerThree;
		} else {
			this.legalMoves = this.legal.workerFour;
		}
	}
}

function determineLegalMoves(worker) {
	const moves = [];
	const row = worker[0];
	const column = worker[1];
	const workerLevel = this.board[4 - row][column];

	const isLegal = isMoveLegal.bind(this);
	
	// Check up
	if(isLegal(worker, workerLevel, row + 1, column)) {
		moves.push([row + 1, column]);
	}

	// Check diag right up
	if(isLegal(worker, workerLevel, row + 1, column + 1)) {
		moves.push([row + 1, column + 1]);
	}

	// Check right
	if(isLegal(worker, workerLevel, row, column + 1)) {
		moves.push([row, column + 1]);
	}
	// Check diag right down
	if(isLegal(worker, workerLevel, row - 1, column + 1)) {
		moves.push([row - 1, column + 1]);
	}
	// Check down
	if(isLegal(worker, workerLevel, row - 1, column)) {
		moves.push([row - 1, column]);
	}
	// Check diag left down
	if(isLegal(worker, workerLevel, row - 1, column - 1)) {
		moves.push([row - 1, column - 1]);
	}
	// Check left
	if(isLegal(worker, workerLevel, row, column - 1)) {
		moves.push([row, column - 1]);
	}
	// Check diag left up
	if(isLegal(worker, workerLevel, row + 1, column - 1)) {
		moves.push([row + 1, column - 1]);
	}

	return moves;
}

function isMoveLegal(worker, level, row, column) {
	if(moveIsOutsideBoard(row, column)) return 0;
	if(this.board[4 - row][column] > level + 1) return 0;
	
	const isLegal = isBuildLegal.bind(this);
	return isLegal(worker, level, row, column);
}

function isBuildLegal(worker, level, row, column) {
	if(moveIsOutsideBoard(row, column)) return 0;
	const workerRow = worker[0];
	const workerColumn = worker[1];
	
	if(samePosition(row, column, this.workerOne)) return 0;
	if(samePosition(row, column, this.workerTwo)) return 0;
	if(samePosition(row, column, this.workerThree)) return 0;
	if(samePosition(row, column, this.workerFour)) return 0;

	if(this.board[4 - row][column] == DOME) return 0;

	return 1;
}


async function playPosition(row, column) {
	const playerTurn = this.playerTurn;
	let w1 = playerTurn == 0 ? this.workerOne : this.workerThree;
	let w2 = playerTurn == 0 ? this.workerTwo : this.workerFour;
	const w3 = playerTurn == 0 ? this.workerThree : this.workerOne;
	const w4 = playerTurn == 0 ? this.workerFour : this.workerTwo;
	const selectedWorker = this.selectedWorker;
	const selectedW = this.selectedWorker == 1 ? w2 : w1;

	if(moveIsOutsideBoard(row, column)) {
		console.log("illegal move");
		// TODO: replace with error message
		return false;
	} 

	switch(this.state) {
		case SETTING_FIRST_WORKER:
			if(samePosition(row, column, w3)) {
				console.log("illegal move -- worker already there");
				// TODO: replace with error message
				return false;
			}

			if(playerTurn == 0) {
				this.workerOne = [row, column];
			} else {
				this.workerThree = [row, column];
			}
			console.log("Set first worker");
			this.lastMove = [row, column];
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
				return false;
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
			this.lastMove = [row, column];

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
				return false;
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
				console.log(this.selectedWorker + " selected");
				this.selectedWorker = 0;
				this.listLegalMoves();
				break; // TODO: replace with error message
			} else if (samePosition(row, column, w2)) {
				console.log(this.selectedWorker + " selected");
				this.selectedWorker = 1;
				this.listLegalMoves();
				break; // TODO: replace with error message
			} else if (samePosition(row, column, w3)) {
				console.log("Can't move on top of third worker");
				return false;
			} else if (samePosition(row, column, w4)) {
				console.log("Can't move on top of fourth worker");
				return false;
			}

			// Position must be adjacent
			if(withinReach(row, column, selectedW)) {
				const attemptedLevel = this.board[4 - row][column];
				if(attemptedLevel == 4) {
					console.log("Can't move on to dome");
					return false;
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
					const moveNotation = getLevelNotation(attemptedLevel) + getNotation(row, column);
					this.moves.push({
						move: MOVING_WORKER,
						notatedMove: (selectedWorker == 1 ? "M" + moveNotation : moveNotation),
						build: -1,
						row: row,
						column: column
					});

					this.lastMove = [row, column];

					if(attemptedLevel == 3) {
						this.state = WON;
						this.winningPlayer = this.playerTurn;
						console.log("Congrats! You win.")
					} else {
						this.state = BUILDING;
					}
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

				this.lastBuild = [row, column];

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

function moveIsOutsideBoard(row, column) {
	return (row < 0 || row > 4) || (column < 0 || column > 4);
}

function getNotation(row, column) {
	return ['a','b','c','d','e'][column] + [1, 2, 3, 4, 5][row];
}

function getLevelNotation(level) {
	if(level < 0 || level > 3) return "";
	return ['', 'f', 's', 't'][level];
}

function getBuildNotation(piece, row, column) {
	if(piece == 1) return getNotation(row, column);
	return piece + getNotation(row, column);
}