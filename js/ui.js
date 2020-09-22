const container = document.getElementById("board");
const iceServers = [
      {
        urls: ['stun:stun.l.google.com:19302', 'stun:stun2.l.google.com:19302',]
      }
];

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
      gutter: .5
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
      const v = this;
      const onChannelOpen = () => { 
        this.sendMessage("Start!");
        this.conn.setup = true;

        setTimeout(() => {
          v.drawBoard();
        }, 500);
      };
      const onMessageReceived = (message) => this.handleIncomingMessage(message);

      const { localDescription, setAnswerDescription, sendMessage } = await createPeerConnection({ iceServers, onChannelOpen, onMessageReceived });

      this.conn.host = true;
      this.setAnswerDescription = setAnswerDescription;
      this.sendMessage = sendMessage;
      this.conn.offer = currentURLWithParam() + btoa(localDescription);
    },
    copyGameOffer: function () {
      navigator.clipboard.writeText(this.conn.offer);
      this.conn.offerCopied = "(Copied)";
    },
    copyAnswerDescription: function () {
      navigator.clipboard.writeText(this.conn.answerDescription);
      this.conn.offerCopied = "(Copied)";
    },
    joinGame: async function() {
      const onChannelOpen = () => console.log('Connection ready!');
      const onMessageReceived = (message) => this.handleIncomingMessage(message);
       
      const remoteDescription = atob(this.conn.remoteDescription);
      let { localDescription, sendMessage } = await createPeerConnection({ remoteDescription, iceServers, onChannelOpen, onMessageReceived });

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
        } else if (v.gameWon == -1) {
          const myTurnNum = v.conn.host ? 0 : 1;
          const isMyTurn = (v.game.playerTurn == myTurnNum);

          if(!isMyTurn) {
            console.log("Receiving move . . .", msg);
            v.playMove({row: parseInt(msg[0]), column: parseInt(msg[2])});
          }
        }
      }
    },
    drawBoard: function() {
      const v = this;

      v.draw = SVG().addTo('#board');

      // Draw board area
      v.draw.size(this.boardSettings.width + "%", this.boardSettings.height + "%");
      v.draw.rect(this.boardSettings.width + "%", this.boardSettings.height + "%").attr({ class:"board-field" });

      // Draw board cells and highlights
      for(var y = 0; y < 5; y++) {
        for(var x = 0; x < 5; x++) {
          const cell = this.draw.rect("19.5%")
                              .attr({ class: "board-cell" });
          const highlight = this.draw.circle("3%").attr({ class: "board-highlight" });
          highlight.center("10%", "10%");

          const group = this.draw.nested().add(cell).add(highlight);
          group.dmove(20 * x + "%", 20 * y + "%");


          if(y == 4) {
            let columnLetter = this.draw.text(['a', 'b', 'c', 'd', 'e'][x]);
            columnLetter.attr({class: "board-letter"});

            // Although odd to nest the single element, we cannot move it
            // using percentages without nesting.
            const letterGroup = this.draw.nested().add(columnLetter);
            letterGroup.dmove((20 * x + 2) + "%", "91%");
          }

          if(x == 4) {
            let rowNumber = this.draw.text(['5', '4', '3', '2', '1'][y]).attr({class: "board-number"});

            const numberGroup = this.draw.nested().add(rowNumber);
            numberGroup.dmove("96%", 20 * y + "%");
          }

          this.board[y][x] = cell;
          this.boardHighlights[y][x] = highlight;

          const row = y;
          const column = x;
          cell.click(function() {
            const myTurnNum = v.conn.host ? 0 : 1;
            const isMyTurn = (v.game.playerTurn == myTurnNum);

            console.log("Clicked cell");

            if(isMyTurn) {
              v.playMove({row: row, column: column });
            }
          });
        }
      }
    },
    drawBuilding: function(row, column) {
      const currentLevelAtPosition = this.game.board[row][column];
      const buildingSize = ["15%", "13%", "10%", "8%"][currentLevelAtPosition - 1];

      let building;
      if(currentLevelAtPosition == this.game.DOME) {
        building = this.draw.circle(this.boardSettings.cellSize - 5);
        building.size(buildingSize);
      } else {
        building = this.draw.rect(this.boardSettings.cellSize - 5, this.boardSettings.cellSize - 5);
        building.size(buildingSize, buildingSize);
      }

      building.attr({ class: "board-piece board-piece-" + currentLevelAtPosition });
      this.moveToBoardPosition(building, row, column);
    },
    drawWorkers: function() {
      this.drawWorkerIfMoved(this.p1.firstWorker, this.game.playerOneFirstWorker, false);
      this.drawWorkerIfMoved(this.p1.secondWorker, this.game.playerOneSecondWorker, false);

      this.drawWorkerIfMoved(this.p2.firstWorker, this.game.playerTwoFirstWorker, true);
      this.drawWorkerIfMoved(this.p2.secondWorker, this.game.playerTwoSecondWorker, true);
    },
    drawWorkerIfMoved: function(worker, gameWorker, isSecondPlayer) {
      if(worker.position[0] != gameWorker[0] || worker.position[1] != gameWorker[1]) {
        worker.position[0] = gameWorker[0];
        worker.position[1] = gameWorker[1];

        if(worker.svg === null ) {
          worker.svg = this.draw.circle("10%");
          worker.svg.attr({class: (isSecondPlayer ? "board-worker-other" : "board-worker")});
        }

        this.moveToBoardPosition(worker.svg, worker.position[0], worker.position[1]);
        worker.svg.front();
      }
    },
    moveToBoardPosition: function(svg, row, column) {
      if(svg.type.localeCompare("rect") == 0) {
        const width = parseInt(svg.attr("width"));
        const height = parseInt(svg.attr("height"));
        svg.x((column*this.boardSettings.cellSize + column*this.boardSettings.gutter + this.boardSettings.cellSize/2 - width/2) + "%")
         .y(((row)*this.boardSettings.cellSize + (row)*this.boardSettings.gutter + this.boardSettings.cellSize/2 - height/2) + "%");
      } else {
        svg.cx((column*this.boardSettings.cellSize + column*this.boardSettings.gutter + this.boardSettings.cellSize/2) + "%")
         .cy(((row)*this.boardSettings.cellSize + (row)*this.boardSettings.gutter + this.boardSettings.cellSize/2) + "%");
      }
    },
    highlightLegalMoves: function() {
      for(const positionPair of this.game.legalMovesForNextTurn) {
        this.board[positionPair[0]][positionPair[1]]
           .attr({class: "board-cell highlightedMove"});
        this.boardHighlights[positionPair[0]][positionPair[1]]
           .attr({ class: "board-highlight" });
      }

      this.game.legalMovesForNextTurn = [];
    },
    highlightLegalBuilds: function() {
      for(const positionPair of this.game.legalBuildsForNextTurn) {
        this.board[positionPair[0]][positionPair[1]]
           .attr({class: "board-cell highlightedBuild"});
        this.boardHighlights[positionPair[0]][positionPair[1]]
           .attr({ class: "board-highlight" });
      }

      this.game.legalBuildsForNextTurn = [];
    },
    removeBoardHighlights: function() {
      for(let row = 0; row < 5; row++) {
        for(let column = 0; column < 5; column++) {
          this.board[row][column].attr({class:"board-cell"});
          this.boardHighlights[row][column].attr({class:"hidden board-highlight"});
        }
      }
    },
  	playMove: function(move) {
      const row = move.row;
      const column = move.column;
      const v = this;
      const myTurnNum = v.conn.host ? 0 : 1;
      const isMyTurn = (v.game.playerTurn == myTurnNum);

      if(this.game.state == v.game.WON) {
        this.gameWon = this.game.winningPlayer;
      } else {
        console.log("Playing position...");
        this.game.playPosition(row, column).then(function(isLegalMove) {
          if(isLegalMove && isMyTurn) {
            console.log("Sending move . . .", move);
            v.sendMessage(move.row + " " + move.column);
          }
          v.removeBoardHighlights();

          if(v.game.lastBuild != null) {
            v.drawBuilding(v.game.lastBuild[0], v.game.lastBuild[1]);
            v.drawWorkers();
            v.game.lastBuild = null;
          }
          if(v.game.lastMove != null) {
            v.drawWorkers();
            v.game.lastMove = null;
            v.game.legalMoves = [];
          }

          if(v.game.state == v.game.MOVING_WORKER) {
            v.game.listLegalMoves();
            v.highlightLegalMoves();
          }

          if(v.game.state == v.game.BUILDING) {
            v.game.listLegalBuilds();
            v.highlightLegalBuilds();
          }

          if(v.game.state == v.game.WON) {
            v.gameWon = v.game.winningPlayer;
          }

        });
      }
    },
    getNotation: function(row, column) {
      return getNotation(row, column);
    }
  }
})
