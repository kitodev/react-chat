import React from 'react';
import ReactDOM from 'react-dom';
import Peer from 'peerjs';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}
var peer = new Peer();
peer.on('open', function(id) {
  peer_id = id;
});
var peer_id = null;

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
      squares: Array(9).fill(null),
      isNext: true,
      peer: new Peer(),
      peer_id: null,
      conn: null,
    };
    this.state.peer.on('open', (id) => {
      peer_id = null;
      this.setState({peer_id: id});
    });
    this.state.peer.on('connection', (conn) => {
      console.log('got connect', conn.peer);
      this.setState({conn: conn});
      conn.on('data', (data) => {
        console.log('Recideved', data);
        if(this.state.xIsNext) {
          this.handleClick(Number(data));
        }
      });
    });
  }
  
  handleClick(i) {
    const squares = this.state.squares.slice();
    if(calculateWinner(squares) || squares[i]) {
      return;
    }
    this.state.conn.send(i);
    squares[i] = this.state.xIsNext ? 'X': 'O';
    this.setState({
      squares: squares,
      xIsNext: !this.state.xIsNext,
    });
  }

  connect(event) {
    var res = document.getElementById("conn").value;
    var conn = this.state.peer.connect(res);
    this.setState({conn: conn});
    conn.on('open', () => {
      this.setState({conn: conn});
    });
    conn.on('data', (data) => {
      console.log('Connection open');
      if(!this.state.xIsNext) {
        this.handleClick(Number(data));
      }
    });
  }

  renderSquare(i) {
    return <Square value={this.state.squares[i]}
            onClick={() => this.handleClick(i)} />;
  }

  render() {
    const winner = calculateWinner(this.state.squares);
    let status;
    if(winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next Player:' + (this.state.xIsNext ? 'X': 'O');
    }

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
        <div>Peer id: {this.state.peer_id}</div>
          <input type="text" placeholder="remote peer per id" id="conn" name="name" />
          <input type="submit" value="Connect" onClick={() => this.connect()} />
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

