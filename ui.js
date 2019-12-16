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
    this.drawBoard(300, 300, 2, 2);
  },
  methods: {
    drawBoard: function(width, height, verticalGutter, horizontalGutter) {
      var vue = this;
      var draw = SVG().addTo('#board');

      draw.rect(width, height).fill("wheat");
      
      cellWidth = (width - verticalGutter * 4) / 5;
      cellHeight = (height - horizontalGutter * 4) / 5;
      draw.size(width + 40, height + 40);

      for(var i = 0; i < 5; i++) {
        for(var j = 0; j < 5; j++) {
          const x = j;
          const y = (4 - i); 

          var rect = draw.rect(cellWidth, cellHeight).move(cellWidth*x + verticalGutter*x, cellHeight*y + horizontalGutter*y).attr({ fill: 'darkgreen' })
          rect.click(function() {
            vue.playMove({row:(4 - y) , column:x });
          });
        }
      }

      draw.text("a").move(25, 300);
      draw.text("b").move(85, 300);
      draw.text("c").move(145, 300);
      draw.text("d").move(205, 300);
      draw.text("e").move(265, 300);


      draw.text("1").move(300, 265);
      draw.text("2").move(300, 205);
      draw.text("3").move(300, 145);
      draw.text("4").move(300, 85);
      draw.text("5").move(300, 25);

    },
  	playMove: function(move) {
      const row = move.row;
      const column = move.column;
      console.log(move);
      this.game.playPosition(row, column).then(function() {
        
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
