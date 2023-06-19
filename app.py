from flask import Flask, render_template, redirect, request, session
from flask_socketio import SocketIO, emit
from flask_session import Session
from Mine_sweeper import *
from engineio.payload import Payload
import json
Payload.max_decode_packets = 500

app = Flask(__name__)
socketio = SocketIO(app)
app.config["SESSION_TYPE"] = "filesystem"
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['DEBUG'] = True
Session(app)

@app.route("/")
def hello_world():
    return render_template('index.html')

@socketio.on('start_game')
def send_board(msg):
    session['board'] = Mine_sweeper(int(msg['rows']),int(msg['cols']))

@socketio.on('check_tile')
def check_tile(msg):
    if int(msg['row']) < session['board'].get_rows() and int(msg['col']) < session['board'].get_cols() and int(msg['row']) >= 0 and int(msg['col']) >= 0:
        emit('return_tile',{
            'row': msg['row'],
            'col': msg['col'],
            'val': session['board'].get_adjacent_mine_count(int(msg['row']),int(msg['col']))
        })

@socketio.on('show_board')
def show_board():
    board = session['board'].get_board()
    for i, row in enumerate(board):
        for j,col in enumerate(row):
            if col =="X":
                emit('show_mine',{
                    'x': i,
                    'y': j
                })


@socketio.on('read_leaderboard')
def read_leaderboard():
    with open('leaderboard.json', 'r') as f:
        data = json.load(f)
        emit("show_leaderboard",{
            'data': data["data"]
        })

@socketio.on('victory')
def victory(msg):
    new_data = {"x":session['board'].get_rows(), "y": session['board'].get_cols(), "name": msg['name'], "time": msg['time']}
    with open('leaderboard.json', 'r+') as f:
        data = json.load(f)
        data["data"].append(new_data)
        data["data"].sort(key=lambda x: x["time"])
        f.seek(0)
        json.dump(data, f,indent = 4)
        f.truncate()

if __name__ == '__main__':
    app.jinja_env.auto_reload = True
    socketio.run(app)