class Graphics {
    constructor(h, w, game) {
        this.game = game,
        this.h = h,
        this.w = w,
        this.ctx = this.initCanvas();
    }
    initCanvas(h, w) {
        let canvas = document.getElementById('board');
        canvas.setAttribute('height', this.h);
        canvas.setAttribute('width', this.w);
        return canvas.getContext('2d');
    }
    renderGame() {
        if (!this.game.paused) {
            this.clearCanvas();
            this.drawBoard(this.game.board);
            this.drawShip(this.game.ship);
            this.drawScore(this.game.score);
        } else {
            this.drawPause();
            // other pause actions/animations
            //...
        }
    }
    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0,0,this.w,this.h);
    }
    drawBoard(board) {
        board.bubbles.forEach(b => {
            this.ctx.fillStyle = `#${b.color}`;
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
            this.ctx.stroke();            
        });
    }
    drawShip(ship) {
        this.ctx.fillStyle = `#${ship.color}`;
        this.ctx.fillRect(ship.x,ship.y,ship.w,ship.h);
    }
    drawScore(score) {

    }
    drawPause(color) {
        $('.pause').css('color', `#${color}`);
        $('.pause').toggle();
    }
}