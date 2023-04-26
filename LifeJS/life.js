"use strict";
let canvas, context; // the canvas and context we will draw the game cells on
let num_rows, num_cols; // the number of rows and columns in the simulation
const cells = []; // will hold an array Cell objects
const refresh_time = 500 // ms to wait before rendering each new frame
let game_on;

class Cell
{
    static width = 10;
    static height = 10;
    static alive_color = '#bb00ff'
    static dead_color = '#bbbbbb'
    
    constructor(context, id, row, col) {
        this.context = context; // the context of the canvas we'll be drawing to
        this.id = id //position w/in the 1d array of cells
        this.row = row;
        this.col = col;
        this.alive = Math.random() >= 0.66; // start with a random field and let it sort itself out (TODO - add interesting start states)
        this.alive_next_turn = false
    }   

    draw_cell() {
        this.context.fillStyle = this.alive ? Cell.alive_color : Cell.dead_color;
        this.context.fillRect(this.col*Cell.width, this.row*Cell.height, Cell.width, Cell.height); // start position and width/height of each cell
    }
};

function update_board() {
    //Loop through the board and determine the fate of each cell and assign it to .alive_next_turn
    //Then loop through the board again and set .alive to .alive_next_turn
    let row, col, cell_status, num_neighbors;

    cells.forEach(cell => {
        col = cell.col;
        row = cell.row;
            
        cell_status = get_cell_status(row, col); // returns 1 if valid and alive and otherwise 0

        num_neighbors = 0;
        num_neighbors += get_cell_status(row-1, col-1);
        num_neighbors += get_cell_status(row-1, col);
        num_neighbors += get_cell_status(row-1, col+1);
        num_neighbors += get_cell_status(row, col-1);
        num_neighbors += get_cell_status(row, col+1);
        num_neighbors += get_cell_status(row+1, col-1);
        num_neighbors += get_cell_status(row+1, col);
        num_neighbors += get_cell_status(row+1, col+1);

        if (cell_status == 0) {
            cell.alive_next_turn = (num_neighbors == 3) // dead cells only come alive with exactly 3 neighbors
        } else {
            cell.alive_next_turn = (num_neighbors == 2 || num_neighbors == 3) // living cells thrive with between 2-3 neighbors
        }
    });

    cells.forEach(cell => {
        cell.alive = cell.alive_next_turn // we don't need to reset alive_next, as every value will be overwritten next time this function is called
    });
}

function get_cell_status(row, col) { // returns 1 if valid and alive and otherwise 0
    let id;
    if (row >= 0 && row < num_rows && col >= 0 && col < num_cols) {
        id = row * num_cols + col // id 0 is the topleft most cells, and there num_cols cols per row        
        if  (cells[id].alive) { 
            return 1
        } 
    }
    return 0 // if cell is dead or out of bounds
}

function create_board_cells() {
    console.log('creating cell grid')
    num_rows = 40 // canvas height must match rows*row_size
    num_cols = 60 // canvas width must match cols*col_size
    
    let id;
    id = 0
    for(let r = 0; r < num_rows; r++) {
        for(let c = 0; c < num_cols; c++) {
            cells.push(new Cell(context, id, r, c));
            id++;
        }
    }
}

function render_board() {    
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the board
    for (let i = 0; i < cells.length; i++) {// Draw each cell on the canvas
        cells[i].draw_cell();
    }
}

function init(){
    console.log('Initializing a Game of Life instance')
    
    // Get a reference to the canvas
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    create_board_cells();
    render_board(); // display the starting conditions for the sim
    game_on = true;
    window.requestAnimationFrame(() => gameLoop()); // start the game loop
}

function gameLoop() {
    if (game_on) {
        update_board(); // check each cell to see if it should be alive next turn and update the .alive tag
        render_board(); // Redraw the game canvas  
    }
    setTimeout( () => { window.requestAnimationFrame(() => gameLoop()); }, refresh_time) // therefore each game loop will last at least refresh_time ms
}

function reset_game() {
    console.log('Restarting simulation')
    cells.forEach(cell => {
        cell.alive = Math.random() >= 0.66;
    });
    render_board()
}

function toggle_pause() {
    console.log('Toggling pause')
    game_on = !game_on //game_loop will keep running when game_on is false but will not update the board or render it
    
    // Update the button text to indicate the action it would perform
    document.getElementById('pause_resume_button').innerText = game_on ? 'Pause' : 'Play'
}

