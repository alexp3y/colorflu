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
        this.drawBoard(this.game.board, this.game.level, this.game.levelProgress);
        this.drawShip(this.game.ship, this.game.levelProgress);
        this.drawScore(this.game.score);
        if (this.game.paused) {
            this.drawPause(this.game.level);
            // other pause actions/animations
        }
    }
    drawBoard(board, level, progress) {
        let gradient = this.ctx.createLinearGradient(0, 0, board.w, 0);
        switch (level) {
            case 1: // white -> black
                let leftShade = 255 - progress;
                let rightShade = leftShade - GRADIENT_OFFSET;
                gradient.addColorStop(0, `rgb(${leftShade}, ${leftShade}, ${leftShade})`);
                gradient.addColorStop(1, `rgb(${rightShade}, ${rightShade}, ${rightShade})`);
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
        board.enemyBursts.forEach(burst => burst.bubbles.forEach(enemy => {
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.r, 0, 2 * Math.PI);
            this.ctx.strokeStyle = palette[enemy.color].hex;
            this.ctx.stroke();            
        }));
        board.ammoBursts.forEach(burst => burst.bubbles.forEach(ammo => {
            this.ctx.beginPath();
            this.ctx.arc(ammo.x, ammo.y, ammo.r, 0, 2 * Math.PI);
            this.ctx.fillStyle = palette[ammo.color].hex;
            this.ctx.fill();
        }));
        board.bullets.forEach(bullet => {
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, bullet.r, 0, 2 * Math.PI);
            this.ctx.fillStyle = palette[bullet.color].hex;
            this.ctx.fill();
        });
    }
    drawShip(ship, progress) {
        // draw enemies in phagocytosis
        ship.phagocytosis.forEach(e => this.drawHalo(e.x, e.y, e.r, palette[e.color].hex));


        // this.drawHalo(palette.blue.hex, 43, 1);
        // this.drawHalo(palette.green.hex, 63, 2);
        // this.drawHalo(palette.maroon.hex, 103, 1);
        
        this.drawCircle(`rgb(${progress/2}, ${progress/2}, ${progress/2})`, 35);

        this.drawCircle(ship.x, ship.y, 34, palette.red.hex);
        this.drawCircle(ship.x, ship.y, 33, palette.purple.hex);
        this.drawCircle(ship.x, ship.y, 28, palette.lightPurple.hex);
        this.drawCircle(ship.x, ship.y, 26, palette.yellow.hex);
        this.drawCircle(ship.x, ship.y, 23, palette.orange.hex);
        this.drawCircle(ship.x, ship.y, 21, palette.darkBlue.hex);
        this.drawCircle(ship.x, ship.y, 17, palette.pink.hex);
        // this.drawCircle(palette.red.hex, 15);
    }
    drawCircle(x, y, r, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawHalo(x, y, r, color, lineWidth) {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.lineWidth = lineWidth;
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.stroke();
    }    
    drawScore(score) {
    }
    drawPause() {
        this.ctx.font = `${this.h/5}px none`;
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = '';
        this.ctx.fillText("PAUSED", this.w/2, this.h/2);        
    }
}