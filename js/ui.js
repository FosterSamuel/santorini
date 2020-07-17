const container = document.getElementById("board");
const iceServers = [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
      {
        urls: 'stun:stun.2.google.com:19302',
      },
      {
        urls: 'stun:stun.3.google.com:19302',
      },
      {
        urls: 'stun:stun.4.google.com:19302',
      },
      {
        urls: 'stun:stun.voiparound.com',
      },
      {
        urls: 'stun:stun.ideasip.com',
      },
      {
        urls: 'stun:stun.iptel.org',
      },
    ];

function clickedBoard(cellNumber) {
	const notation = getNotation(x, y);
	alert("Row: " + x + ", Col: " + y + " (" + getNotation(x, y) + ")");
}

function getNotationWithPiece(piece, row, column) {
	return piece + "" + getNotation(row, column);
} 

function currentURLWithParam() {
  return window.location + "?join=";
}

var app = new Vue({
  el: '#container',
  data: {
    conn: {
      setup: false,
      host: false,
      starting: false,
      offer: "",
      offerCopied: "",
      remoteDescription: "",
      answerDescription: "",
      remoteAnswerDescription: "",
      state: "Connected"
    },
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
      playerOneColor: "#00b2f6",
      playerTwoColor: "#c99d79"
    },
    gameWon: -1,
    game: startGame(),
    setAnswerDescription: null,
    sendMessage: null
  },
  created: function () {
    const parsedUrl = new URL(window.location.href);
    const joinCode = null || parsedUrl.searchParams.get("join");

    if(joinCode) {
      this.conn.remoteDescription = joinCode;
      this.joinGame();
    }
  },
  methods: {
    reloadPage: function() {
      window.location.reload(); 
    },
    createGame: async function () {
      const onChannelOpen = () => { 
        this.sendMessage("Start!");
        this.conn.setup = true;
        setTimeout(() => {
          this.drawBoard();
        }, 500);
      };
      const onMessageReceived = (message) => this.handleIncomingMessage(message);
      const onConnectionStateChange = (event) => {
        this.conn.state = event.target.connectionState;
        console.log(event);
      };
      
      const { localDescription, setAnswerDescription, sendMessage } = await createPeerConnection({ iceServers, onMessageReceived, onChannelOpen, onConnectionStateChange });

      this.conn.host = true;
      this.setAnswerDescription = setAnswerDescription;
      this.sendMessage = sendMessage;
      this.conn.offer = currentURLWithParam() + btoa(localDescription);
    },
    copyGameOffer: function () {
      navigator.clipboard.writeText(this.conn.offer);
      this.conn.offerCopied = "(Copied!)";
    },
    copyAnswerDescription: function () {
      navigator.clipboard.writeText(this.conn.answerDescription);
      this.conn.offerCopied = "(Copied!)";
    },
    joinGame: async function() {
      const remoteDescription = atob(this.conn.remoteDescription);
      const onChannelOpen = () => console.log(`Connection ready!`);
      const onMessageReceived = (message) => this.handleIncomingMessage(message);
      const onConnectionStateChange = (event) => {
        this.conn.state = event.target.connectionState;
        console.log(event);
      };
      
      let { localDescription, sendMessage } = await createPeerConnection({ remoteDescription, iceServers, onMessageReceived, onChannelOpen, onConnectionStateChange });

      this.conn.answerDescription = btoa(localDescription);
      this.sendMessage = sendMessage;
    },
    startGame: function() {
      const v = this;
      v.conn.starting = true;
      const answerDescription = atob(v.conn.remoteAnswerDescription);
      
      setTimeout(() => {
        v.setAnswerDescription(answerDescription);
      }, 1000);
    },
    handleIncomingMessage: function(msg) {
      const v = this;
      if(msg.length == 0 || msg.length > 15) {
        // Ignore message of unrealistic size.
        console.log("Long message received. Ignoring.");
      } else {
        if(v.conn.setup == false) {
          v.conn.setup = true;
          setTimeout(() => {
            v.drawBoard();
          }, 500);
        } else if (v.gameWon == -1){
          const myTurnNum = v.conn.host ? 0 : 1;
          const isMyTurn = (v.game.playerTurn == myTurnNum);

          if(!isMyTurn) {
            console.log("Receiving move . . .", msg);
            v.playMove({row: parseInt(msg[0]), column: parseInt(msg[2])});
          }
        } else {
          v.restartGame();
        }
      }
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
            const myTurnNum = v.conn.host ? 0 : 1;
            const isMyTurn = (v.game.playerTurn == myTurnNum);

            if(isMyTurn) {
              playMove({row:(4 - y) , column:x });
            }
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

      let boardClass = "board-piece-";

      if(level == FIRST_LEVEL) {
        building.size("15%","15%");     
        boardClass += "1";
      } else if (level == SECOND_LEVEL) {
        building.size("13%","13%");
        boardClass += "2";
      } else if (level == THIRD_LEVEL) {
        building.size("10%","10%");
        boardClass += "3";
      } else if (level == DOME) {
        building = this.draw.circle(this.boardSettings.cellSize - 5);
        building.size("8%");
        boardClass += "4";
      }


      building.attr({ class: "board-piece " + boardClass });

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
      svg.cx((column*this.boardSettings.cellSize + column*this.boardSettings.gutter + this.boardSettings.cellSize/2) + "%")
         .cy(((4-row)*this.boardSettings.cellSize + (4-row)*this.boardSettings.gutter + this.boardSettings.cellSize/2) + "%");
    },
  	playMove: function(move) {
      const row = move.row;
      const column = move.column;
      const v = this;
      const myTurnNum = v.conn.host ? 0 : 1;
      const isMyTurn = (v.game.playerTurn == myTurnNum);

      if(this.game.state == WON) {
        this.gameWon = this.game.winningPlayer;
      } else {
        this.game.playPosition(row, column).then(function(isLegalMove) {
          if(isLegalMove && isMyTurn) {
            console.log("Sending move . . .", move);
            v.sendMessage(move.row + " " + move.column);
          }
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