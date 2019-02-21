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
        this.ctx.clearRect(0,0,this.w,this.h);
        this.drawBoard(this.game.board);
        this.drawShip(this.game.ship);
        this.drawScore(this.game.score);
        if (this.game.paused) {
            this.drawPause();
            // other pause actions/animations
        }
    }
    drawBoard(board) {
        let gradient = this.ctx.createLinearGradient(0, 0, board.w, 0);
        gradient.addColorStop(0, `rgb(${board.gradientStart}, ${board.gradientStart}, ${board.gradientStart})`);
        gradient.addColorStop(1, `rgb(${board.gradientEnd}, ${board.gradientEnd}, ${board.gradientEnd})`);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, board.w, board.h);

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
        this.ctx.font = `${this.h/5}px none`;
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = '';
        this.ctx.fillText("PAUSED", this.w/2, this.h/2);        
    }
}