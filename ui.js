
document.createSvg = function(tagName) {
    return this.createElementNS("http://www.w3.org/2000/svg", tagName);
};
    
function createBoard(pixelsPerSide, colors) {
        
}

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
    board: [],
    game: startGame()
  },
  mounted: function () {
    this.board = this.game.board;
  },
  methods: {
  	playMove: function() {
      
  		const dimensions = this.move.split(" ");
  		const row = parseInt(dimensions[0]);
  		const column = parseInt(dimensions[1]);

      this.game.playPosition(row, column);

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
  	}
  }
})