function create_board(vars){
	var board = $("<div></div>");
	board.game = new TicTacToe(vars);
	var game = board.game;
	var board_table = $("<table></table>").addClass("tttTable");
	for(var i = 0; i<game.size; i++){
		var row = $("<tr></tr>");
		for(var j = 0; j<game.size; j++){
			row.append($("<td></td>").addClass("tttcell").text(" "));
		}
		board_table.append(row);
	}
	board.append(board_table).addClass("tttGame");
	return board;
}

function set_current_game(board){
	var game = board.game;
	board.addClass("tttcurr");
	if (game.turn==='o' && game.players == 1){
		var aimove = game.make_ai_move();
		board.find(".tttcell").eq(aimove).addClass("tttO");
	}
	board.find(".tttcell").click(function(e) {
		if ($(this).hasClass("tttO")||$(this).hasClass("tttX")){
			
		} else {
			if (!game.is_terminal()){
				$(this).addClass("ttt"+game.turn.toUpperCase());
				var index = board.find(".tttcell").index(this);
				game.make_player_move(index);
			} else{
				return;
			}
			if (!game.is_terminal() && game.players==1){
				var aimove = game.make_ai_move();
				board.find(".tttcell").eq(aimove).addClass("tttO");
			}
			if (game.is_terminal()){
				switch(game.get_winner()){
					case 'x':
					if (game.players == 1){
						$("#winner #message").html("You Won!");
					} else {
						$("#winner #message").html("Player X Won!");
					}
					board.trigger("game_finished", "win");
					break;
					case 'o':
					if (game.players == 1){
						$("#winner #message").html("You Lost!");
					} else {
						$("#winner #message").html("Player O Won!");
					}
					board.trigger("game_finished", "lose");
					break;
					default:
					$("#winner #message").html("Sigh.. It's just a Tie..");
					board.trigger("game_finished", "tie");
				}
				lineplace = game.get_winner_place();
				if(lineplace){
					var line = $("<div></div>").addClass("line").addClass(lineplace.place);
					var pos = (lineplace.row+0.5) * 100 / game.size + "%";
					if(lineplace.place === "hor"){
						line.css({top: pos});
					} else if (lineplace.place === "ver"){
						line.css({left: pos});
					}
					board.append(line);
				}
				$("#winner").dialog("open");
				remove_current_game(board);
			}
		}
    });
}

function remove_current_game(board){
	board.removeClass("tttcurr");
	board.addClass("tttFinished");
}
