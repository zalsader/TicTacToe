function TicTacToe(vars) {
	vars = vars || {};
	this.vars = vars;
	this.board = new Array();
	this.size = Number(vars.size) || 3;
	this.depth = Number(vars.depth) || Infinity;
	this.hardness = Number(vars.hardness) || 1.0;
	this.players = Number(vars.players) || 1;
	this.turn = vars.turn || 'x';
	for (var i = 0; i < this.size; i++) {
		this.board[i] = new Array();
		for (var j = 0; j < this.size; j++) {
			this.board[i][j] = '-';
		}
	}

};

TicTacToe.prototype.get_board = function() {
	return this.board;
};

TicTacToe.prototype.make_player_move = function(i,j) {
	if (_.isUndefined(j)){
		j = ~~(i/this.size);
		i = i % this.size;	
	}
	if (!(0 <= i && i <= this.size-1 && 0 <= j && j <= this.size-1) ||
		this.board[i][j] != '-') {
		return false;
	}

	this.board[i][j] = this.turn;
	this.turn = this.turn === 'x'? 'o': 'x';
	return true;
};

TicTacToe.prototype.make_ai_move = function() {
	var available_moves = this.get_moves();
	var move = toss_a_coin(this.hardness)? alpha_beta(this): _.sample(available_moves);
	this.board[move[0]][move[1]] = 'o';
	this.turn = this.turn === 'x'? 'o': 'x';
	return move[1]*this.size+move[0];
};

TicTacToe.prototype.get_moves = function(player) {

	var moves = new Array();

	for (var i = 0; i < this.size; i++) {
		for (var j = 0; j < this.size; j++) {
			if(this.board[i][j] == '-') {
				moves.push([i,j]);
			}
		}
	}

	return moves;

};

TicTacToe.prototype.is_terminal = function() {
	var no_spaces = !_.chain(this.board).flatten().some(_.equals('-')).value();
	return no_spaces || this.get_winner() != false;
};

TicTacToe.prototype.get_score = function() {
	var lines = get_lines(this.board), score = 0;
	winner = this.get_winner();
	if (winner==='x') return Infinity;
	else if (winner ==='o') return -Infinity;
	else{
		for (var i = 0; i < lines.length; i++) {
			var xrow = _.chain(lines[i])
				.filter( _.equals('x'))
				.size()
				.value();
			var orow = _.chain(lines[i])
				.filter( _.equals('o'))
				.size()
				.value();
			score += Math.pow(10, xrow);
			score -= Math.pow(10, orow);
		}
	}
	return score;
};

TicTacToe.prototype.get_winner = function() {
	var lines = get_lines(this.board);
	for (var i = 0; i < lines.length; i++) {
		if (_.every(lines[i], _.equals('x'))) {
			return 'x';
		}
		if (_.every(lines[i], _.equals('o'))) {
			return 'o';
		}
	}
	return false;
};

TicTacToe.prototype.get_winner_place = function() {
	var places = ["ver", "hor", "diag"];
	var lines = get_lines(this.board);
	for (var i = 0; i < lines.length; i++) {
		if (_.every(lines[i], _.equals('x')) || _.every(lines[i], _.equals('o'))) {
			var place = places[~~(i/this.size)];
			var row = i%this.size;
			if (place==="diag" && row === 1){
				place = "rev"+place;
			}
			return {"row":row, "place":place};
		}
	}
	return false;
};

TicTacToe.prototype.get_next = function(move,player) {
	if (player == "max") {
		player = 'x';
	} else {
		player = 'o';
	}

	var next_state = new TicTacToe(this.vars);
	next_state.board = copy_board(this.board);
	next_state.board[move[0]][move[1]] = player;

	return next_state;
};

function alpha_beta(state) {
	// this method is called by AI, so we started with min.
	return min_value(state,-Infinity,Infinity,true, state.depth);
};

function max_value(state,alpha,beta,is_first, depth) {

	var is_first = is_first || false;

	if (state.is_terminal()||depth===0) {
		return state.get_score();
	}

	var v = -Infinity, moves = state.get_moves("max"), min, best_move = moves[0];

	for (var i = 0; i < moves.length; i++) {
		min = min_value(state.get_next(moves[i],"max"),alpha,beta,false, depth-1);
		if (min > v) v = min, best_move = moves[i];
		if (v >= beta) {
			if (is_first) return moves[i];
			return v;
		}
		if (v > alpha) alpha = v;
	}

	if (is_first) {
		return best_move;
	} else {
		return v;
	}

};

function min_value(state,alpha,beta,is_first, depth) {

	var is_first = is_first || false;

	if (state.is_terminal()||depth===0) {
		// this method returns the heuristic value of the state, 
		// with win = Infinity, and lose = -Infinity
		return state.get_score();
	}

	var v = Infinity, moves = state.get_moves("min"), max, best_move = moves[0];

	for (var i = 0; i < moves.length; i++) {
		max = max_value(state.get_next(moves[i],"min"),alpha,beta,false, depth-1);
		if (max < v) v = max, best_move = moves[i];
		if (v <= alpha) {
			if (is_first) return moves[i];
			return v;
		}
		if (v < beta) beta = v;
	}

	if (is_first) {
		return best_move;
	} else {
		return v;
	}

};

function copy_board(board) {
	var new_board = Array();
	for (var i = 0; i < board.length; i++) {
		new_board[i] = board[i].slice(0);
	}
	return new_board;
};

function get_lines(mat){
	var lines = new Array();
	if (!mat) return lines;
	var i, j, line;
	for (i = 0; i<mat.length; i++) {
		line = Array();
		for (j = 0; j<mat[0].length; j++) {
			line.push(mat[i][j]);
		}
		lines.push(line);
	}
	for (j = 0; j<mat[0].length; j++) {
		line = Array();
		for (i = 0; i<mat.length; i++) {
			line.push(mat[i][j]);
		}
		lines.push(line);
	}
	if (mat.length === mat[0].length){
		line = Array();
		for (i = 0; i<mat.length; i++) {
			line.push(mat[i][i]);
		}
		lines.push(line);
		line = Array();
		for (i = 0; i<mat.length; i++) {
			line.push(mat[i][mat.length-i-1]);
		}
		lines.push(line);
	}
	return lines;
}

// returns true with a probability of prob 
function toss_a_coin(prob){
	return Math.random() < prob;
}

_.mixin({equals:function(eq){return function(val){return val===eq;}; }});