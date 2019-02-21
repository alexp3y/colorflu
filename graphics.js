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
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
            if (b.color != 'black') {
                this.ctx.fillStyle = b.color;
                this.ctx.fill();
            } else {
                this.ctx.strokeStyle = b.color;
                this.ctx.stroke();            
            }
        });
        board.bullets.forEach(b => {
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
            this.ctx.fillStyle = b.color;
            this.ctx.fill();
        })
    }
    drawBubbleStack(bubbles) {
        
    }
    drawShip(ship) {
        this.ctx.fillStyle = ship.color;
        this.ctx.beginPath();
        this.ctx.arc(ship.x, ship.y, ship.r, 0, 2 * Math.PI);
        this.ctx.fill();
        
        let r = ship.r;
        ship.bubbles.forEach(b => {
            if (r > 0) {
                this.ctx.beginPath();
                this.ctx.arc(ship.x, ship.y, r, 0, 2 * Math.PI);
                this.ctx.strokeStyle = b.color;
                this.ctx.linewidth = 5;
                this.ctx.stroke(); 
                r++;
            }
        })
    }
    drawScore(score) {
    }
    drawPause(color) {
    }
}