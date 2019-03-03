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
            this.drawPause(game.ship);
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
                this.drawCircle(e.x, e.y, e.r, this.hex2rgba(palette[e.color].hex, 0.2));
            } else {
                this.drawHalo(e.x, e.y, e.r, this.progressColor, 1);
            }
        }));
        board.ammoBursts.forEach(burst => burst.bubbles.forEach(a => this.drawCircle(a.x, a.y, a.r, this.hex2rgba(palette[a.color].hex, 0.75))));
        board.bullets.forEach(bullet => this.drawCircle(bullet.x, bullet.y, bullet.r, palette[bullet.color].hex));
    }
    drawShip(ship) {
        // draw ammo halo
        let haloWidth = ship.r + 2;
        Object.keys(ship.ammo).forEach(a => {
            for (let i = 0; i < ship.ammo[a]; i++) {
                this.drawHalo(ship.x, ship.y, haloWidth, this.hex2rgba(palette[a].hex, 0.18), 1, 0, 2*Math.PI);
                haloWidth += 2;
            }
        });

        // draw enemies in phagocytosis
        ship.phagocytosis.forEach(e => {
            this.drawHalo(e.x, e.y, e.r, this.progressColor, 1);
        });

        // DRAW SHIP
        this.drawCircle(ship.x, ship.y, SHIP_RADIUS, palette[ship.color].hex);

        // let plasmidRadius = ship.r - radiusOffset; // number of total plasmids
        // predraw infection level plasmids
        // for (let i = 0; i < ship.infectionLevel; i++) {
        //     this.drawHalo(ship.x, ship.y, plasmidRadius, this.progressColor, 2, 0, 2*Math.PI, true);
        //     plasmidRadius--;
        // }
        ship.phagocytosis.forEach(e => {
            this.ctx.beginPath();       
            let xFrom = ship.x + (ship.r * Math.cos(e.phagoTheta));
            let yFrom = ship.y + (ship.r * Math.sin(e.phagoTheta));
            let xTo = ship.x + ((ship.r - INFECT_RADIUS_OFFSET) * Math.cos(e.phagoTheta));
            let yTo = ship.y + ((ship.r - INFECT_RADIUS_OFFSET) * Math.sin(e.phagoTheta));
            let xPlasmid = ship.x + ((ship.r - INFECT_RADIUS_OFFSET - PLASMID_RADIUS) * Math.cos(e.phagoTheta));
            let yPlasmid = ship.y + ((ship.r - INFECT_RADIUS_OFFSET - PLASMID_RADIUS) * Math.sin(e.phagoTheta));
            this.ctx.moveTo(xFrom, yFrom);
            this.ctx.lineTo(xTo, yTo);
            this.ctx.stroke();
            this.drawHalo(ship.x, ship.y, SHIP_RADIUS, this.progressColor, 1, e.phagoTheta + .25, e.phagoTheta - .25, true);
            // this.drawHalo(ship.x, ship.y, plasmidRadius, this.progressColor, 2, 0, 2*Math.PI, true); // e.phagoTheta + .21, e.phagoTheta - .21, true);
            this.drawHalo(xPlasmid, yPlasmid, PLASMID_RADIUS, this.progressColor, 2, 0, 2*Math.PI, true); // e.phagoTheta + .21, e.phagoTheta - .21, true);
            // plasmidRadius--;
        });
        ship.infection.forEach(i => {
            this.drawHalo(i.x, i.y, i.r, this.progressColor, 2, 0, 2*Math.PI, true); // e.phagoTheta + .21, e.phagoTheta - .21, true);
        });
    }


    drawCircle(x, y, r, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawHalo(x, y, r, color, lineWidth, startRad, endRad, anti) {
        startRad = (startRad) ? startRad : 0;
        endRad = (endRad) ? endRad : 2 * Math.PI;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.lineWidth = lineWidth;
        this.ctx.arc(x, y, r, startRad, endRad, anti);
        this.ctx.stroke();
    }    

    drawScore(score) {
    }

    drawPause(ship) {
        this.ctx.font = `${this.h/5}px IBM Plex Sans`;
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = ship.color;
        this.ctx.fillText("PAUSED", this.w/2, this.h/2);        
    }

    hex2rgba(hex, alpha) {
        let r = parseInt(hex.slice(1,3), 16);
        let g = parseInt(hex.slice(3,5), 16);
        let b = parseInt(hex.slice(5,7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}