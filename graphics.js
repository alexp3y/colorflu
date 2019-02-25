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
        this.drawBoard(this.game.board, this.game.level);
        this.drawShip(this.game.ship, this.game.level);
        this.drawScore(this.game.score);
        if (this.game.paused) {
            this.drawPause(this.game.level);
            // other pause actions/animations
        }
    }
    drawBoard(board, level) {
        let gradient = this.ctx.createLinearGradient(0, 0, board.w, 0);
        switch (level) {
            case 1: // white -> black
                gradient.addColorStop(0, `rgb(${board.leftWallShade}, ${board.leftWallShade}, ${board.leftWallShade})`);
                gradient.addColorStop(1, `rgb(${board.rightWallShade}, ${board.rightWallShade}, ${board.rightWallShade})`);
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, board.w, board.h);
                break;
            case 2: // black -> red
                gradient.addColorStop(0, `rgb(${board.leftWallShade}, ${board.leftWallShade}, ${board.leftWallShade})`);
                gradient.addColorStop(1, `rgb(${board.rightWallShade}, ${board.rightWallShade}, ${board.rightWallShade})`);
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, board.w, board.h);
                break;
            case 3:
                break;
        
            default:
                break;
        }
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
        this.paint();
        // this.ctx.fillStyle = ship.color;
        // this.ctx.beginPath();
        // this.ctx.arc(ship.x, ship.y, ship.r, 0, 2 * Math.PI);
        // this.ctx.fill();
        
        // let r = ship.r;
        // ship.bubbles.forEach(b => {
        //     if (r > 0) {
        //         this.ctx.beginPath();
        //         this.ctx.arc(ship.x, ship.y, r, 0, 2 * Math.PI);
        //         this.ctx.strokeStyle = b.color;
        //         this.ctx.linewidth = 5;
        //         this.ctx.stroke(); 
        //         r++;
        //     }
        // })
    }
    paint() { 
        this.drawHalo(palette.blue, 43, 1);
        this.drawHalo(palette.green, 63, 1);
        this.drawHalo(palette.maroon, 103, 1);
        
        this.drawCircle('black', 35);

        // this.drawCircle(palette.lightPurple, 35);
        this.drawCircle(palette.purple, 33);
        this.drawCircle(palette.lightPurple, 28);
        this.drawCircle(palette.yellow, 26);
        this.drawCircle(palette.orange, 23);
        this.drawCircle(palette.darkBlue, 21);
        this.drawCircle(palette.pink, 17);
        this.drawCircle(palette.red, 15);
    }
    drawCircle(color, r) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(this.game.ship.x, this.game.ship.y, r, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawHalo(color, r, width) {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.lineWidth = width;
        this.ctx.arc(this.game.ship.x, this.game.ship.y, r, 0, 2 * Math.PI);
        this.ctx.stroke();
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