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
    board: [],
    boardSettings: {
      width: 300,
      height: 300,
      cellWidth: 0,
      cellHeight: 0,
      verticalGutter: 2,
      horizontalGutter: 2,
      playerOneColor: "blue",
      playerTwoColor: "orangered"
    },
    game: startGame()
  },
  mounted: function () {
    this.board = this.game.board;
    this.drawBoard();
    this.drawNotation();
  },
  methods: {
    drawBoard: function() {
      this.draw = SVG().addTo('#board');
      const width = this.boardSettings.width;
      const height = this.boardSettings.height;
      const verticalGutter = this.boardSettings.verticalGutter;
      const horizontalGutter = this.boardSettings.horizontalGutter;
      const playMove = this.playMove;

      this.boardSettings.cellWidth = (width - verticalGutter * 4) / 5;
      this.boardSettings.cellHeight = (height - horizontalGutter * 4) / 5;

      this.draw.size(width + 40, height + 40);
      this.draw.rect(width, height).fill("wheat");

      for(var i = 0; i < 5; i++) {
        for(var j = 0; j < 5; j++) {
          const x = j;
          const y = (4 - i); 

          var rect = this.draw.rect(this.boardSettings.cellWidth, this.boardSettings.cellHeight)
                              .move(this.boardSettings.cellWidth*x + this.boardSettings.verticalGutter*x, 
                                    this.boardSettings.cellHeight*y + this.boardSettings.horizontalGutter*y)
                              .attr({ fill: 'darkgreen' })
          rect.attr({ class: "board-cell" });
          rect.click(function() {
            playMove({row:(4 - y) , column:x });
          });
        }
      }
    },
    drawNotation: function() {
      this.draw.text("a").move(25, 300);
      this.draw.text("b").move(85, 300);
      this.draw.text("c").move(145, 300);
      this.draw.text("d").move(205, 300);
      this.draw.text("e").move(265, 300);

      this.draw.text("1").move(300, 265);
      this.draw.text("2").move(300, 205);
      this.draw.text("3").move(300, 145);
      this.draw.text("4").move(300, 85);
      this.draw.text("5").move(300, 25);
    },
    drawWorkers: function() {
      this.renderWorkerIfMoved(this.p1.firstWorker, this.game.workerOne, this.boardSettings.playerOneColor);
      this.renderWorkerIfMoved(this.p1.secondWorker, this.game.workerTwo, this.boardSettings.playerOneColor);
      this.renderWorkerIfMoved(this.p2.firstWorker, this.game.workerThree, this.boardSettings.playerTwoColor);
      this.renderWorkerIfMoved(this.p2.secondWorker, this.game.workerFour, this.boardSettings.playerTwoColor);
    },
    renderWorkerIfMoved: function(worker, gameWorker, color) {
      if(worker.position[0] != gameWorker[0] || worker.position[1] != gameWorker[1]) {
        worker.position[0] = gameWorker[0];
        worker.position[1] = gameWorker[1];

        if(worker.svg === null ) {
          worker.svg = this.draw.circle(this.boardSettings.cellWidth - 10);
          worker.svg.fill(color);
        }

        this.moveSVGToBoardPosition(worker.svg, worker.position[0], worker.position[1]);
      }
    },
    moveSVGToBoardPosition: function(svg, row, column) {
      svg.cx(column*this.boardSettings.cellWidth + column*this.boardSettings.verticalGutter + this.boardSettings.cellWidth/2)
         .cy((4-row)*this.boardSettings.cellHeight + (4-row)*this.boardSettings.horizontalGutter + this.boardSettings.cellHeight/2);
    },
  	playMove: function(move) {
      const row = move.row;
      const column = move.column;
      const v = this;
      console.log(move);
      this.game.playPosition(row, column).then(function() {
        console.log(v.game);
        v.drawWorkers();
      });

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
  	playBuild: function() {
  		const dimensions = this.build.split(" ");
  		const row = parseInt(dimensions[0]);
  		const column = parseInt(dimensions[1]);

      this.game.playPosition(row, column);
      this.board = this.game.board;
      /* 

  		const lastMove = this.moves[this.moves.length-1];

  		let boardPlace = this.board[4 - row][column];

  		// Must build in progression (0 --> 1, 1 --> 2, etc)
  		if(piece == boardPlace + 1) {
  			this.board[4 - row][column] = parseInt(piece);
  		}

  		console.log(this.board);


  		if(lastMove.build == -1) {
  			lastMove.build = getNotationWithPiece(piece, row, column);
  		}
      */
  	},
    getNotation: function(row, column) {
      return getNotation(row, column);
    }
  }
})
