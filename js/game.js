function startGame() {
	const GAME = {
		board: newBoard(),
		listLegalMoves: listLegalMoves,
		listLegalBuilds: listLegalBuilds,
		playPosition: playPosition,
		legal: {
			playerOneFirstWorker: {
				builds: [],
				moves: []
			},
			playerOneSecondWorker: {
				builds: [],
				moves: []
			},
			playerTwoFirstWorker: {
				builds: [],
				moves: []
			},
			playerTwoSecondWorker: {
				builds: [],
				moves: []
			}
		},
		legalMovesForNextTurn: [],
		legalBuildsForNextTurn: [],
		lastBuild: null,
		lastMove: null,

		// List of all moves played in the current game
		moves: [],

		// Whose turn it is (0 = player one, 1 = player two)
		playerTurn: 0, 

		// Which of the two workers the current player has selected
		selectedWorker: -1,

		// 0 = player one wins, 1 = player two wins
		winningPlayer: -1, 
		// Negative positions means workers not placed on the board yet
		playerOneFirstWorker: [-1, -1],
		playerOneSecondWorker: [-1, -1],
		playerTwoFirstWorker: [-1, -1],
		playerTwoSecondWorker: [-1, -1],
		// Levels on the board
		GROUND: 0,
	  	FIRST_LEVEL: 1,
	  	SECOND_LEVEL: 2,
	  	THIRD_LEVEL: 3,
		DOME: 4,
		// Game states
	  	SETTING_FIRST_WORKER: 0,
		SETTING_SECOND_WORKER: 1,
		CHOOSING_WORKER: 2,
		MOVING_WORKER: 3,
		BUILDING: 4,
		WON: 5,
		// Start in SETTING_FIRST_WORKER state
		state: 0
	};

	function listLegalBuilds() {
		// Clear previously stored legal builds
		this.legalBuildsForNextTurn = [];
	
		const findLegalBuilds = determineLegalMoves.bind(this);
		const findingMovesThatAreBuilds = true;

		// Find and store legal builds for each worker
		this.legal.playerOneFirstWorker.builds = findLegalBuilds(findingMovesThatAreBuilds, this.playerOneFirstWorker);
		this.legal.playerOneSecondWorker.builds = findLegalBuilds(findingMovesThatAreBuilds, this.playerOneSecondWorker);
		this.legal.playerTwoFirstWorker.builds = findLegalBuilds(findingMovesThatAreBuilds, this.playerTwoFirstWorker);
		this.legal.playerTwoSecondWorker.builds = findLegalBuilds(findingMovesThatAreBuilds, this.playerTwoSecondWorker);

		// For the next turn, store which legal builds are available based on player and selected worker
		if(this.playerTurn == 0) {
			if(this.selectedWorker == 0) {
				this.legalBuildsForNextTurn = this.legal.playerOneFirstWorker.builds;
			} else {
				this.legalBuildsForNextTurn = this.legal.playerOneSecondWorker.builds;
			}
		} else {
			if(this.selectedWorker == 0) {
				this.legalBuildsForNextTurn = this.legal.playerTwoFirstWorker.builds;
			} else {
				this.legalBuildsForNextTurn = this.legal.playerTwoSecondWorker.builds;
			}
		}
	}

	function listLegalMoves() {
		// Clear previous stored legal moves
		this.legalMovesForNextTurn = [];
	
		const findLegalMoves = determineLegalMoves.bind(this);
		
		// Find and store legal moves for each worker
		this.legal.playerOneFirstWorker.moves = findLegalMoves(false, this.playerOneFirstWorker);
		this.legal.playerOneSecondWorker.moves = findLegalMoves(false, this.playerOneSecondWorker);
		this.legal.playerTwoFirstWorker.moves = findLegalMoves(false, this.playerTwoFirstWorker);
		this.legal.playerTwoSecondWorker.moves = findLegalMoves(false, this.playerTwoSecondWorker);
		
		// For the next turn, store which legal moves are available for the player's selected worker
		if(this.playerTurn == 0) {
			if(this.selectedWorker == 0) {
				this.legalMovesForNextTurn = this.legal.playerOneFirstWorker.moves;
			} else {
				this.legalMovesForNextTurn = this.legal.playerOneSecondWorker.moves;
			}
		} else {
			if(this.selectedWorker == 0) {
				this.legalMovesForNextTurn = this.legal.playerTwoFirstWorker.moves;
			} else {
				this.legalMovesForNextTurn = this.legal.playerTwoSecondWorker.moves;
			}
		}
	}

	function determineLegalMoves(moveIsBuild, worker) {
		const moves = [];

		// Row, column, and level of worker
		const row = worker[0];
		const column = worker[1];
		const workerLevel = this.board[row][column];
		

		let isLegalMoveForWorker = isMoveLegal.bind(this);

		if(moveIsBuild) {
			// Are we checking for legal builds instead of moves? We better use the appropriate function
			isLegalMoveForWorker = isBuildLegal.bind(this);
		}

		// Check all neighboring spots on the board for legal moves
		for(let spacesAwayFromRow = -1; spacesAwayFromRow <= 1; spacesAwayFromRow++) {
			for(let spacesAwayFromColumn = -1; spacesAwayFromColumn <= 1; spacesAwayFromColumn++) {
				const neighboringRow = row + spacesAwayFromRow;
				const neighboringColumn = column + spacesAwayFromColumn;

				if(isLegalMoveForWorker(worker, workerLevel, neighboringRow, neighboringColumn)) {
					moves.push([neighboringRow, neighboringColumn]);
				}
			}
		}

		return moves;
	}
	
	function isMoveLegal(worker, level, row, column) {
		if(isOutsideBoard(row, column)) return false;
		if(this.board[row][column] > level + 1) return false;
		
		// If the move is not trying to move a worker higher than one step,
		// the remaining legal moves are the same as the legal builds
		return isBuildLegal.call(this, worker, level, row, column);		
	}
	
	function isBuildLegal(worker, level, row, column) {
		// Can't build outside the board
		if(isOutsideBoard(row, column)) return false;

		const workerRow = worker[0];
		const workerColumn = worker[1];
		
		// Can't build on other workers
		if(isSamePosition(row, column, this.playerOneFirstWorker)) return false;
		if(isSamePosition(row, column, this.playerOneSecondWorker)) return false;
		if(isSamePosition(row, column, this.playerTwoFirstWorker)) return false;
		if(isSamePosition(row, column, this.playerTwoSecondWorker)) return false;
		

		// Can't build on dome
		if(this.board[row][column] == this.DOME) return false;
	
		return true;
	}

	function isSamePosition(row, column, rowColumnSet) {
		return rowColumnSet[0] == row && rowColumnSet[1] == column;
	}

	function isOutsideBoard(row, column) {
		return (row < 0 || row > 4) || (column < 0 || column > 4);
	}
	
	function isReachableByWorker(worker, row, column) {
		const rowDistance = Math.abs(row - worker[0]);
		const columnDistance = Math.abs(column - worker[1]);
	
		return rowDistance < 2 && columnDistance < 2;
	}
	
	function getNotation(row, column) {
		// Example: row = 1, column = 3 ---> "d2"
		return ['a','b','c','d','e'][column] + [1, 2, 3, 4, 5][row];
	}
	
	function getLevelNotation(level) {
		if(level < 0 || level > 3) return "";
		// "" = ground level move
		// f  = first level
		// s  = second level
		// t  = third level (Winning move!)
		return ['', 'f', 's', 't'][level];
	}
	
	function getBuildNotation(piece, row, column) {
		if(piece == 1) return getNotation(row, column);
		return piece + getNotation(row, column);
	}

	function workersHaveNoLegalMoves(firstWorker, secondWorker) {
		const findLegalMoves = determineLegalMoves.bind(this);

		const firstWorkerHasNoMoves = findLegalMoves(false, firstWorker).length == 0;
		const secondWorkerHasNoMoves = findLegalMoves(false, secondWorker).length == 0;

		return firstWorkerHasNoMoves && secondWorkerHasNoMoves;
	}

	function workersHaveNoLegalBuilds(firstWorker, secondWorker) {
		const findLegalBuilds = determineLegalMoves.bind(this);

		const firstWorkerHasNoBuilds = findLegalBuilds(true, firstWorker).length == 0;
		const secondWorkerHasNoBuilds = findLegalBuilds(true, secondWorker).length == 0;

		return firstWorkerHasNoBuilds && secondWorkerHasNoBuilds;
	}

	async function playPosition(row, column) {
		const playerTurn = this.playerTurn;
		
		const PLAYER_ONE = 0;
		const PLAYER_TWO = 1;

		// Store the current and other players' workers. The default values are for when it
		// is it the first player's turn.
		let currentPlayerFirstWorker = this.playerOneFirstWorker;
		let currentPlayerSecondWorker = this.playerOneSecondWorker;

		let otherPlayerFirstWorker = this.playerTwoFirstWorker;
		let otherPlayerSecondWorker = this.playerTwoSecondWorker;

		// If it is the second player's turn, the appropriate swap is made.
		if(playerTurn == PLAYER_TWO) {
			currentPlayerFirstWorker = this.playerTwoFirstWorker;
			currentPlayerSecondWorker = this.playerTwoSecondWorker;

			otherPlayerFirstWorker = this.playerOneFirstWorker;
			otherPlayerSecondWorker = this.playerOneSecondWorker;
		}

		const selectedWorker = this.selectedWorker;
		const selectedW = this.selectedWorker == 0 ? currentPlayerFirstWorker : currentPlayerSecondWorker;
	
		if(isOutsideBoard(row, column)) {
			console.log("SANTORINI: Tried to play (" + row + ", " + column + "), which is outside of the board.");
			return false;
		} 
	
		switch(this.state) {
			case this.SETTING_FIRST_WORKER:
				if(isSamePosition(row, column, otherPlayerFirstWorker)) {
					console.log("SANTORINI: Worker already exists on (" + row + ", " + column +").");
					return false;
				}
				
				// Set the first (or second) player's first worker on the board
				if(playerTurn == PLAYER_ONE) {
					this.playerOneFirstWorker = [row, column];
				} else {
					this.playerTwoFirstWorker = [row, column];
				}

				// Store last move's position
				this.lastMove = [row, column];

				if(this.moves.length == 0) {
					// Notate and store the move.
					this.moves.push({
						move: this.SETTING_FIRST_WORKER,
						notatedMove: getNotation(row, column),
						build: -1,
						row: row,
						column: column
					});
				} else {
					// The SETTING_FIRST_WORKER state is called twice. Once by the first player and
					// and once by the second player. For nice formatting of the moves, we combine the
					// setting of workers into one line of notation. For example: c3-d3-b2-c2
					
					// To do this, we need to pop out and modify the move.
					const lastMove = this.moves.pop();
					lastMove.notatedMove += "-" + getNotation(row, column);
					this.moves.push(lastMove);
				}

				this.state = this.SETTING_SECOND_WORKER;
				break;
			case this.SETTING_SECOND_WORKER:
				if (isSamePosition(row, column, currentPlayerFirstWorker) ||
					isSamePosition(row, column, otherPlayerFirstWorker) ||
					isSamePosition(row, column, otherPlayerSecondWorker)) {
					console.log("SANTORINI: Worker already exists on (" + row + ", " + column +").");
					return false;
				} 
				
				// Set the first (or second) player's second worker on the board
				if(playerTurn == PLAYER_ONE) {
					this.playerOneSecondWorker = [row, column];
				} else {
					this.playerTwoSecondWorker = [row, column];
				}

				// This time, we know we've already set works, letting us pop
				// and modify without needing to check the history of moves.
				const lastMove = this.moves.pop();
				lastMove.notatedMove += "-" + getNotation(row, column);
				this.moves.push(lastMove);
				
				// Store last move's position
				this.lastMove = [row, column];
	
				if(this.playerTurn == PLAYER_ONE) {
					// Let the second player set their workers
					this.playerTurn = PLAYER_TWO;
					this.state = this.SETTING_FIRST_WORKER;
				} else {
					// Otherwise, move forward to first move of game
					this.playerTurn = PLAYER_ONE;
					this.state = this.CHOOSING_WORKER;
				}
				break;
			case this.CHOOSING_WORKER:
				// Here we enjoy the benefit of the logic used to set the current and 
				// other players' workers. We only have to check two workers!
				if(isSamePosition(row, column, currentPlayerFirstWorker)) {
					// Choose their first worker
					this.selectedWorker = 0;
				} else if (isSamePosition(row, column, currentPlayerSecondWorker)) {
					// Choose their second worker
					this.selectedWorker = 1;
				} else {
					this.selectedWorker = -1;
					console.log("SANTORINI: No worker available for selection at (" + row + ", column).");
					return false;
				}
	
				if (this.selectedWorker > -1) {
					// Now that a worker is selected, we can move this worker
					this.state = this.MOVING_WORKER;
				}
				break;
			case this.MOVING_WORKER:

				// While in the MOVING_WORKER state, the player can change their selected
				// worker before committing to moving to a new square
				if(isSamePosition(row, column, currentPlayerFirstWorker)) {
					this.selectedWorker = 0;
					this.listLegalMoves();

					// Break needed to be able to repeat this state
					break; 
				} else if (isSamePosition(row, column, currentPlayerSecondWorker)) {
					this.selectedWorker = 1;
					this.listLegalMoves();

					// Break needed to be able to repeat this state
					break; 
				}
				
				// Can't move on other workers
				if (isSamePosition(row, column, otherPlayerFirstWorker)) {
					console.log("SANTORINI: Worker already on (" + row + ", " + column +").");
					return false;
				} else if (isSamePosition(row, column, otherPlayerSecondWorker)) {
					console.log("SANTORINI: Worker already on (" + row + ", " + column +").");
					return false;
				}


				// Position must be next to the selected worker and at a reachable height
				if(isReachableByWorker(selectedW, row, column)) {
					const attemptedLevel = this.board[row][column];
					if(attemptedLevel == 4) {
						console.log("SANTORINI: Can't move to dome.");
						return false;
					}
	
					const workerRow = selectedW[0];
					const workerColumn = selectedW[1];
					const currentLevel = this.board[workerRow][workerColumn];

					if(attemptedLevel - currentLevel <= 1) {

						// Move the player's selected worker to (row, column)
						if(playerTurn == PLAYER_ONE) {
							if(selectedWorker == 0) {						
								this.playerOneFirstWorker = [row, column];	
							} else {
								this.playerOneSecondWorker = [row, column];
							}
						} else {
							if(selectedWorker == 0) {						
								this.playerTwoFirstWorker = [row, column];	
							} else {
								this.playerTwoSecondWorker = [row, column];	
							}
						}
						
						// We need this for a legal move check later
						if(selectedWorker == 0) {
							currentPlayerFirstWorker = [row, column];
						} else {
							currentPlayerSecondWorker = [row, column];
						}

						// Notate and store move
						const moveNotation = getLevelNotation(attemptedLevel) + getNotation(row, column);
						this.moves.push({
							move: this.MOVING_WORKER,
							notatedMove: (selectedWorker == 1 ? "M" + moveNotation : moveNotation),
							build: -1,
							row: row,
							column: column
						});
						
						// Store this move's position
						this.lastMove = [row, column];
						
						// Game win conditions:
						// 		- Worker gets to third level
						//		- Other player has no legal moves
						//		- Other player has no legal builds

						// For the last situation, we check when the current player moves and 
						// finds themselves with no legal builds left, triggering a win for the other player.
						
						const otherPlayerHasNoMoves = workersHaveNoLegalMoves.call(this, otherPlayerFirstWorker, otherPlayerSecondWorker);
						const currentPlayerHasNoBuilds = workersHaveNoLegalBuilds.call(this, currentPlayerFirstWorker, currentPlayerSecondWorker);

						if(attemptedLevel == this.THIRD_LEVEL || otherPlayerHasNoMoves) {
							// Worker got to third level? Other player ran out of legal moves? Win!
							this.state = this.WON;
							this.winningPlayer = this.playerTurn;
						} else if (currentPlayerHasNoBuilds) {
							// Uh oh! You're out of legal builds. Other player wins.
							this.state = this.WON;
							this.winningPlayer = this.playerTurn == PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
						} else {
							// Otherwise, move to building
							this.state = this.BUILDING;
						}
					}
				}
				break;
			case this.BUILDING:
				// Can't build on a worker
				if(isSamePosition(row, column, currentPlayerFirstWorker) || 
				   isSamePosition(row, column, currentPlayerSecondWorker) ||
				   isSamePosition(row, column, otherPlayerFirstWorker) ||
				   isSamePosition(row, column, otherPlayerSecondWorker)) {
					return false;
				}
	
				const currentLevel = this.board[row][column];
				
				if(currentLevel == this.DOME) {
					// Can't build on top of dome
					return false;
				}
				
				if(!isReachableByWorker(selectedW, row, column)) {
					console.log("SANTORINI: Must build next to selected worker.");
					return false;
				} else {
					// Build at (row, column)
					this.board[row][column] = currentLevel + 1;
					
					// Modify the previous move to include the notation for the build.
					// Example: "d2" --> "d2 c3"
					const lastMove = this.moves.pop();
					lastMove.move = this.BUILDING;
					lastMove.build = getBuildNotation(currentLevel + 1, row, column);
					lastMove.row = row;
					lastMove.column = column;
					this.moves.push(lastMove);
					
					// Store the last build's position
					this.lastBuild = [row, column];
					
					// Swap to other player and let them choose a worker for their turn
					this.playerTurn = playerTurn == PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
					this.state = this.CHOOSING_WORKER;
				}
				break;
		}

		return true;
	}

	return GAME;
}

function newBoard() {
	return [[0, 0, 0, 0, 0],  // Row 0
			[0, 0, 0, 0, 0],  // Row 1
			[0, 0, 0, 0, 0],  // Row 2
			[0, 0, 0, 0, 0],  // Row 3
			[0, 0, 0, 0, 0]]; // Row 4
		  // Col 0
		  //    Col 1
		  //       Col 2
		  //          Col 3
		  //    	     Col 4
}