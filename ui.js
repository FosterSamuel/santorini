const container = document.getElementById("board");

function clickedBoard(cellNumber) {
	const notation = getNotation(x, y);
	alert("Row: " + x + ", Col: " + y + " (" + getNotation(x, y) + ")");
}

function getNotationWithPiece(piece, row, column) {
	return piece + "" + getNotation(row, column);
} 

var app = new Vue({
  el: '#container',
  data: {
    move: '',
    build: '',
    draw: null,
    p1: {
      firstWorker: {
        position: [-1, -1],
        svg: null
      },
      secondWorker: {
        position: [-1, -1],
        svg: null
      }
    },
    p2: {
      firstWorker: {
        position: [-1, -1],
        svg: null
      },
      secondWorker: {
        position: [-1, -1],
        svg: null
      }
    },
    board: newBoard(),
    boardHighlights: newBoard(),
    boardSettings: {
      width: 100,
      height: 100,
      cellSize: 19.5,
      gutter: .5,
      playerOneColor: "#ffd8a8",
      playerTwoColor: "#99e9f2"
    },
    gameWon: -1,
    game: startGame()
  },
  mounted: function () {
    this.drawBoard();
  },
  methods: {
    restartGame: function() {
      window.location.reload();
    },
    drawBoard: function() {
      const v = this;
      const playMove = this.playMove;

      this.draw = SVG().addTo('#board');
      this.draw.size(this.boardSettings.width + "%", this.boardSettings.height + "%");
      this.draw.rect(this.boardSettings.width + "%", this.boardSettings.height + "%").attr({ class:"board-field" });

      for(var i = 0; i < 5; i++) {
        for(var j = 0; j < 5; j++) {
          const x = j;
          const y = (4 - i); 

          var rect = this.draw.rect("19.5%")
                              .attr({ class: "board-cell" });
          
          //rect.move(.move(this.boardSettings.cellWidth*x + this.boardSettings.verticalGutter*x, 
            //                        this.boardSettings.cellHeight*y + this.boardSettings.horizontalGutter*y)
          var circle = this.draw.circle("3%")
                                .attr({ class: "board-highlight" });
          circle.center("10%", "10%");
          var group = this.draw.nested().add(rect).add(circle)
          group.move(20 * x + "%", 20 * y + "%");

          this.board[y][x] = rect;
          this.boardHighlights[y][x] = circle;
          rect.click(function() {
            playMove({row:(4 - y) , column:x });
          });
        }
      }
    },
    drawWorkers: function() {
      this.renderWorkerIfMoved(this.p1.firstWorker, this.game.workerOne, this.boardSettings.playerOneColor);
      this.renderWorkerIfMoved(this.p1.secondWorker, this.game.workerTwo, this.boardSettings.playerOneColor);
      this.renderWorkerIfMoved(this.p2.firstWorker, this.game.workerThree, this.boardSettings.playerTwoColor);
      this.renderWorkerIfMoved(this.p2.secondWorker, this.game.workerFour, this.boardSettings.playerTwoColor);
    },
    drawBoardPiece: function(row, column) {
      const level = this.game.board[4 - row][column];
      let building;

      if(level != DOME) {
        building = this.draw.rect(this.boardSettings.cellSize - 5, this.boardSettings.cellSize - 5);
      }

      console.log(level);
      if(level == FIRST_LEVEL) {
        building.size("15%","15%");
        building.fill("#495057");
      } else if (level == SECOND_LEVEL) {
        building.size("13%","13%");
        building.fill("#868e96");
      } else if (level == THIRD_LEVEL) {
        building.size("10%","10%");
        building.fill("#adb5bd");
      } else if (level == DOME) {
        building = this.draw.circle(this.boardSettings.cellSize - 5);
        building.size("8%");
        building.fill("#4c6ef5");
      }

      building.attr({ class: "board-piece" });

      this.moveSVGToBoardPosition(building, row, column);
      if(level == DOME) {
        this.centerSVGToBoardPosition(building, row, column);
      }
    },
    renderWorkerIfMoved: function(worker, gameWorker, color) {
      if(worker.svg) worker.svg.front();
      if(worker.position[0] != gameWorker[0] || worker.position[1] != gameWorker[1]) {
        worker.position[0] = gameWorker[0];
        worker.position[1] = gameWorker[1];

        if(worker.svg === null ) {
          worker.svg = this.draw.circle("10%");
          worker.svg.fill(color);
        }

        this.centerSVGToBoardPosition(worker.svg, worker.position[0], worker.position[1]);
      }
    },
    moveSVGToBoardPosition: function(svg, row, column) {
      const width = parseInt(svg.attr("width"));
      const height = parseInt(svg.attr("height"));
      svg.x((column*this.boardSettings.cellSize + column*this.boardSettings.gutter + this.boardSettings.cellSize/2 - width/2) + "%")
         .y(((4-row)*this.boardSettings.cellSize + (4-row)*this.boardSettings.gutter + this.boardSettings.cellSize/2 - height/2) + "%");
    },
    centerSVGToBoardPosition: function(svg, row, column) {
      console.log("cx: " + ((column*this.boardSettings.cellSize + column*this.boardSettings.gutter + this.boardSettings.cellSize/2) + "%") );
      svg.cx((column*this.boardSettings.cellSize + column*this.boardSettings.gutter + this.boardSettings.cellSize/2) + "%")
         .cy(((4-row)*this.boardSettings.cellSize + (4-row)*this.boardSettings.gutter + this.boardSettings.cellSize/2) + "%");
    },
  	playMove: function(move) {
      const row = move.row;
      const column = move.column;
      const v = this;
      console.log(move);

      if(this.game.state == WON) {
        this.gameWon = this.game.winningPlayer;
      } else {
        this.game.playPosition(row, column).then(function() {
          v.clearBoard();
          if(v.game.lastBuild != null) {
            v.drawBoardPiece(v.game.lastBuild[0], v.game.lastBuild[1]);
            v.drawWorkers();
            v.game.lastBuild = null;
          }
          if(v.game.lastMove != null) {
            v.drawWorkers();
            v.clearBoard();
            v.game.lastMove = null;
            v.game.legalMoves = [];
          }

          if(v.game.state == MOVING_WORKER) {
            v.game.listLegalMoves();
            v.highlightLegalMoves();
          }

          if(v.game.state == BUILDING) {
            v.game.listLegalBuilds();
            v.highlightLegalBuilds();
          }

          if(v.game.state == WON) {
            v.gameWon = v.game.winningPlayer;
          }
        });
      }

      /*
  		const workerOne = this.workerOne;

  		workerOne[0] = row;
  		workerOne[1] = column;


  		let boardPlace = this.board[4 - row][column];
  		if(boardPlace == 3) {
  			alert("You win!");
  		}

  		this.moves.push({ move: getNotation(row, column), build: -1});
  	  */
    },
    clearBoard: function() {
      for(let row = 0; row < 5; row++) {
        for(let column = 0; column < 5; column++) {
          this.board[row][column].attr({class:"board-cell"});
          this.boardHighlights[row][column].attr({class:"hidden board-highlight"});
        }
      }
    },
    highlightLegalMoves: function() {
      for(const positionPair of this.game.legalMoves) {
        this.board[4 - positionPair[0]][positionPair[1]]
           .attr({class: "board-cell highlightedMove"});
        this.boardHighlights[4 - positionPair[0]][positionPair[1]]
           .attr({ class: "board-highlight" });
      }

      this.game.legalMoves = [];
    },
    highlightLegalBuilds: function() {
      console.log("Checking legal");
      console.log(this.game.legalBuilds);
      for(const positionPair of this.game.legalBuilds) {
        this.board[4 - positionPair[0]][positionPair[1]]
           .attr({class: "board-cell highlightedBuild"});
        this.boardHighlights[4 - positionPair[0]][positionPair[1]]
           .attr({ class: "board-highlight" });
      }

      this.game.legalBuilds = [];
    },
    getNotation: function(row, column) {
      return getNotation(row, column);
    }
  }
})
