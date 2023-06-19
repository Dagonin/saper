$(document).ready(function(){
    var socket = io.connect('http://localhost:5000');
   });

timer


$("#start").click(start_game)

$("#leaderboard").click(function(){
    socket.emit("read_leaderboard")
})

function start_game(){
    row_num = $('#row_num').val()
    col_num = $('#col_num').val()

    if(row_num < 10 || row_num > 50 || col_num < 10 ||col_num > 50){
        row_num = 10
        col_num = 10
        alert("zly rozmiar")
    }

    $(".Game").empty()
    $("#counter").empty()
    $("#timer").empty()
    socket.emit('start_game',{
        rows: row_num,
        cols: col_num
    })
    for(i = 0 ; i< col_num ; i++){
        $(".Game").append(`<div class='row' id='${i}'></div>`)
        for(j = 0 ; j< row_num ; j++){
            $(`#${i}`).append(`<div class='tile active' row='${j}' col='${i}'></div>`)
        }
    }
    $(".active"). bind("contextmenu", function(e) { return false; });
    add_event_listener()
    refresh_counter()
    start_timer()
}

function add_event_listener(){
    $(".active").mousedown(function(event){
        switch (event.which) {
            case 1:
                check_tile($(this).attr('row'),$(this).attr('col'))
                $(this).unbind('mousedown')
                break;
            case 3:
                $(this).toggleClass('flag')
                refresh_counter()
                win_condition()
                break;
            default:
                alert('Nothing');
        }
    })
}

function game_over(){
    $(".active").unbind('mousedown')
    clearInterval(timer)
    socket.emit('show_board')
}


function refresh_counter(){
    all_mines = parseInt($(".tile").length / 5)
    $("#counter").text(all_mines - $(".flag").length)
}

function check_tile(x,y){
    socket.emit('check_tile', {
        row: x, 
        col: y})
}


socket.on('show_mine', function(msg){
    $(`[row=${msg.x}][col=${msg.y}]`).addClass('mine')
   })



socket.on('return_tile', function(msg){
    x = parseInt(msg.row)
    y = parseInt(msg.col)
    if(msg.val == -1){
      game_over()
    }else if(msg.val == 0){
        for (dx = -1; dx <= 1; ++dx) {
            for (dy = -1; dy <= 1; ++dy) {
                if (dx != 0 || dy != 0) {
                    if(!$(`[row=${x+dx}][col=${y+dy}]`).hasClass('clicked')){
                        check_tile(x+dx,y+dy)
                    }
                    
                }
            }
        }
    }else{
        $(`[row=${x}][col=${y}]`).text(msg.val)
        
    }
    $(`[row=${x}][col=${y}]`).unbind('mousedown')
    $(`[row=${x}][col=${y}]`).addClass('clicked')
    win_condition()
   })

   socket.on('show_leaderboard', function(msg){
    data = msg.data
    $(".leaderboards").empty()
    data.forEach(entry => {
        add_to_leaderboards(entry)
    });
   })

   function add_to_leaderboards(entry){
    target = $(`[size=${entry.x}x${entry.y}]`)
    if(target.length!=0){
        target.append(`<div class="content">${entry.name}: ${entry.time}</div>`)
    }else{
        el = $(`<div class="collapsible" size="${entry.x}x${entry.y}"></div>`).text(`${entry.x}x${entry.y}`)
        el.append(`<div class="content">${entry.name}: ${entry.time}</div>`)
        el.click(function(){
            $(this).toggleClass("open")
            children = $(this).find('div')
            for(i = 0; i<children.length;i++){
                $(children[i]).toggleClass("show")
            }
        })
        
        $(".leaderboards").append(el)
    }
   }


function start_timer(){
    clearInterval(timer)
    n = 1
    timer = setInterval(function(){
        $("#timer").text(n)
        n++
    },1000)
   }

function win_condition(){
    tile_count = $(".tile").length
    cleared_tiles =$(".clicked").length
    flagged_tiles = $(".flag").length
    if(tile_count == flagged_tiles+cleared_tiles && flagged_tiles == parseInt($(".tile").length / 5)){
        clearInterval(timer)
        user = window.prompt("Gratulacje wygrałeś! Podaj swoje imie.","");
        
        socket.emit('victory',{name: user, time: parseInt($("#timer").text())})
    }
}

