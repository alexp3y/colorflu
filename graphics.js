class Graphics {
    constructor(h, w) {
        this.h = h,
        this.w = w,
        this.progressColor = '',
        this.baseColor = '',
        this.offsetColor = '',
        this.ctx = this.initCanvas();
    }
    renderGame(game) {
        let progressShade = Math.floor(game.levelProgress/18);
        this.progressColor = this.makeColor(progressShade);
        let baseShade = 255 - progressShade;
        this.baseColor = this.makeColor(baseShade);
        this.offsetColor = this.makeColor(baseShade - GRADIENT_OFFSET);

        this.clearScreen();
        this.drawBoard(game.board, game.level);
        this.drawShip(game.ship);
        this.drawScore(game.score);
        if (game.paused) {
            this.drawPause(game.level);
        }
    }
    initCanvas() {
        let canvas = document.getElementById('board');
        canvas.setAttribute('height', this.h);
        canvas.setAttribute('width', this.w);
        return canvas.getContext('2d');
    }
    clearScreen() {
        this.ctx.clearRect(0,0,this.w,this.h);
    }
    makeColor(shade) {
        return `rgb(${shade}, ${shade}, ${shade})`;
    }
    drawBoard(board, level) {
        let gradient = this.ctx.createLinearGradient(0, 0, board.w, 0);
        switch (level) {
            case 1: // white -> black
                gradient.addColorStop(0, this.baseColor);
                gradient.addColorStop(1, this.offsetColor);
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, board.w, board.h);
                break;
            case 2: // black -> red
                gradient.addColorStop(0, this.baseColor);
                gradient.addColorStop(1, this.offsetColor);
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, board.w, board.h);
                break;
            case 3:
                break;
        
            default:
                break;
        }
        board.enemyBursts.forEach(burst => burst.bubbles.forEach(e => {
            if (e.isDestroyed()) {
                this.drawHalo(e.x, e.y, e.r, palette[e.color].hex, 1);
            } else {
                this.drawHalo(e.x, e.y, e.r, this.progressColor, 1);
            }
        }));
        board.ammoBursts.forEach(burst => burst.bubbles.forEach(a => this.drawCircle(a.x, a.y, a.r, palette[a.color].hex)));
        board.bullets.forEach(bullet => this.drawCircle(bullet.x, bullet.y, bullet.r, palette[bullet.color].hex));
    }
    drawShip(ship) {
        // draw enemies in phagocytosis
        ship.phagocytosis.forEach(e => {
            if (e.isDestroyed()) {
                this.drawHalo(e.x, e.y, e.r, palette[e.color].hex, 1)
            } else {
                this.drawHalo(e.x, e.y, e.r, this.progressColor, 1)
            }    

        });
        this.drawCircle(ship.x, ship.y, 35, palette.pink.hex);
        // this.drawCircle(ship.x, ship.y, 33, this.progressColor);
        
        // this.drawHalo(palette.blue.hex, 43, 1);
        // this.drawHalo(palette.green.hex, 63, 2);
        // this.drawHalo(palette.maroon.hex, 103, 1);

        
        
        // this.drawCircle(ship.x, ship.y, 26, palette.blue.hex);
        // this.drawCircle(ship.x, ship.y, 24, palette.green.hex);
        // this.drawCircle(ship.x, ship.y, 22, palette.maroon.hex);
        // this.drawCircle(ship.x, ship.y, 20, palette.purple.hex);
        // this.drawCircle(ship.x, ship.y, 18, palette.lightPurple.hex);
        // this.drawCircle(ship.x, ship.y, 32, palette.yellow.hex);
        // this.drawCircle(ship.x, ship.y, 30, palette.orange.hex);
        // this.drawCircle(ship.x, ship.y, 28, palette.darkBlue.hex);
        // this.drawCircle(ship.x, ship.y, 26, palette.blue.hex);
        // this.drawCircle(ship.x, ship.y, 24, palette.green.hex);
        // this.drawCircle(ship.x, ship.y, 22, palette.maroon.hex);
        // this.drawCircle(ship.x, ship.y, 20, palette.purple.hex);
        // this.drawCircle(ship.x, ship.y, 18, palette.lightPurple.hex);
        // this.drawCircle(ship.x, ship.y, 16, palette.yellow.hex);
        // this.drawCircle(ship.x, ship.y, 14, palette.orange.hex);
        // this.drawCircle(ship.x, ship.y, 12, palette.darkBlue.hex);
        this.drawCircle(ship.x, ship.y, 10, palette.pink.hex);
        // this.drawCircle(palette.red.hex, 15);
    }


    drawCircle(x, y, r, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawHalo(x, y, r, color, lineWidth, startRad, endRad) {
        startRad = (startRad) ? startRad : 0;
        endRad = (endRad) ? endRad : 2 * Math.PI;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.lineWidth = lineWidth;
        this.ctx.arc(x, y, r, startRad, endRad);
        this.ctx.stroke();
    }    

    drawScore(score) {
    }

    drawPause() {
        this.ctx.font = `${this.h/5}px IBM Plex Sans`;
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = '';
        this.ctx.fillText("PAUSED", this.w/2, this.h/2);        
    }
}