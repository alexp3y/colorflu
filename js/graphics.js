const CAPSULE_IMG_POS = 20;

class Graphics {
    constructor(h, w) {
        this.h = h,
        this.w = w,
        this.progressColor = '',
        this.gradBaseColor = '',
        this.gradOffsetColor = '',
        this.ctx = this.initCanvas();

    }
    renderGame(game) {
        this.updateProgressColors(game.levelProgress);
        this.clearScreen();
        if (!game.titleOn || game.gameOver) {
            this.drawBoard(game.board, game.level);
            if (game.ship.isDestroyed()) {
                this.drawDestroyedShip(game.ship);
            } else {
                this.drawShip(game.ship, game.paused);
            }                       
        }
        if (game.paused) {
            this.drawPause(game.ship);
            this.drawMenu(game.menu, game.paused)
        } else if (game.titleOn) {
            this.drawTitle(game);
            this.drawMenu(game.menu, game.paused);
        }
    }
    initCanvas() {
        let canvas = document.getElementById('board');
        canvas.setAttribute('height', this.h);
        canvas.setAttribute('width', this.w);
        return canvas.getContext('2d');
    }
    initImages() {
        this.capsuleImg.src = './capsule.png';   
    }
    drawImage() {
        this.ctx.drawImage(this.capsuleImg, 10, 10);
    }
    updateProgressColors(progress) {
        // gradient colors
        let gradBaseShade = 255 - Math.floor(progress/18);
        let gradOffsetShade = gradBaseShade - GRADIENT_OFFSET;
        this.gradBaseColor = this.makeColor(gradBaseShade);
        this.gradOffsetColor = this.makeColor(gradBaseShade - GRADIENT_OFFSET);        
        // progress color
        let progressShade = Math.floor(progress/9);
        if (progress < 3000) {
            if (gradOffsetShade - progressShade < 0) {
                progressShade += 130;
            }
            this.progressColor = this.makeColor(progressShade);
        } else {
            this.progressColor = this.makeColor(255);
        }
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
                gradient.addColorStop(0, this.gradBaseColor);
                gradient.addColorStop(1, this.gradOffsetColor);
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, board.w, board.h);
                break;
            case 2: // black -> red
                gradient.addColorStop(0, this.gradBaseColor);
                gradient.addColorStop(1, this.gradOffsetColor);
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
    drawShip(ship, paused) {
        // draw ammo halo
        let haloWidth = ship.r + 2;
        Object.keys(ship.ammo).forEach(a => {
            for (let i = 0; i < ship.ammo[a]; i++) {
                this.drawHalo(ship.x, ship.y, haloWidth, this.hex2rgba(palette[a].hex, 0.18), 1, 0, 2*Math.PI);
                haloWidth += 2;
            }
        });
        // draw enemies in phagocytosis
        ship.phagocytosis.forEach(e => this.drawHalo(e.x, e.y, e.r, this.progressColor, 1));
        // DRAW SHIP
        let alpha = (paused) ? 0.1 : 0.9;
        this.drawCircle(ship.x, ship.y, SHIP_RADIUS, this.hex2rgba(palette[ship.color].hex, alpha));
        // draw phagocytosis cells
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
            this.drawHalo(ship.x, ship.y, SHIP_RADIUS, this.progressColor, 1, e.phagoTheta + .3, e.phagoTheta - .3, true);
            this.drawHalo(xPlasmid, yPlasmid, PLASMID_RADIUS, this.progressColor, 2, 0, 2*Math.PI, true); // e.phagoTheta + .21, e.phagoTheta - .21, true);
        });
        // draw infected plasmids
        ship.infection.forEach(i => {
            this.drawHalo(i.x, i.y, i.r, this.progressColor, 2, 0, 2*Math.PI, true); // e.phagoTheta + .21, e.phagoTheta - .21, true);
        });
    }
    
    drawDestroyedShip(ship) {
        // draw free-floating infected plasmids
        ship.infection.forEach(i => {
            this.drawHalo(i.x, i.y, i.r, this.progressColor, 2, 0, 2*Math.PI, true); // e.phagoTheta + .21, e.phagoTheta - .21, true);
        });
        // simulate broken apart ship wall
        let radIncrement = 2*Math.PI / DESTROYED_SHIP_FRAGMENTS;
        let fragmentStartRad = 0;
        let fragmentEndRad = radIncrement;
        ship.destroyedFragments.forEach(f => {
            this.drawHalo(f.x, f.y, f.r, this.hex2rgba(palette[f.color].hex, 0.5), INFECT_RADIUS_OFFSET, fragmentStartRad, fragmentEndRad);
            fragmentStartRad += radIncrement;
            fragmentEndRad += radIncrement;
        });
    }

    drawCircle(x, y, r, color, anti) {
        anti = (anti) ? true : false;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI, anti);
        this.ctx.fill();
    }
    
    drawHalo(x, y, r, color, lineWidth, startRad, endRad, anti) {
        anti = (anti) ? true : false;
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

    drawTitle(game) {
        let menuRadius = this.h * 2/3;
        this.drawCircle(this.w/2, this.h/2, menuRadius, this.hex2rgba('#000000', 0.5), );
        for (let i = 1; i < 30; i++) {
            this.drawHalo(this.w/2, this.h/2, menuRadius, this.hex2rgba(palette[randomColor(i%8)].hex, 0.5), 1);
            menuRadius-=5;
        }
        let x = this.w * .22;
        let y = this.h/3;
        this.ctx.font = `${this.h/5}px IBM Plex Sans`;
        this.ctx.fillStyle = this.hex2rgba(palette['pink'].hex, 0.75);
        this.ctx.fillText('COLOR', x, y);
        let colorTextLen = this.ctx.measureText('COLOR').width;
        this.ctx.fillStyle = 'black';
        this.ctx.fillText('FLU', x+colorTextLen, y );
    }

    drawPause(ship) {
        this.drawCircle(this.w/2, this.h/2, this.h/2, this.hex2rgba('#000000', 0.5));
        this.ctx.font = `${this.h/5}px IBM Plex Sans`;
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = ship.color;
        this.ctx.fillText("PAUSED", this.w/2, this.h/3);  
    }
    
    drawMenu(menu, paused) {
        this.ctx.textAlign = "left";
        this.ctx.font = `${this.h/15}px IBM Plex Sans`;
        this.ctx.fillStyle = 'black';
        let margin = this.h/9;
        let optionWidth = this.w/2 - margin;
        let option1Height = this.h/2;
        let option2Height = this.h/2 + margin;
        let option3Height = this.h/2 + 2*margin;
        let option4Height = this.h/2 + 3*margin;
        let selectorWidth = optionWidth - 2*SHIP_RADIUS;
        let selectorHeight = 0;
        if (paused) {
            this.ctx.fillText("resume", optionWidth, option1Height);  
            this.ctx.fillText("new game", optionWidth, option2Height);  
            this.ctx.fillText("controls", optionWidth, option3Height);
            this.ctx.fillText("sound", optionWidth, option4Height);
        } else {
            this.ctx.fillText("new game", optionWidth, option1Height);  
            this.ctx.fillText("controls", optionWidth, option2Height);
            this.ctx.fillText("sound", optionWidth, option3Height);
        }
        switch (menu.selected) {
            case "RESUME":
                selectorHeight = option1Height;
                break;
            case "NEW_GAME":
                selectorHeight = (paused) ? option2Height : option1Height;
                break;
            case "CONTROLS":
                selectorHeight = (paused) ? option3Height : option2Height;
                break;
            case "SOUND":
                selectorHeight = (paused) ? option4Height : option3Height;
                break;
            default:
                break;
        }
        selectorHeight -= SHIP_RADIUS;
        this.drawCircle(selectorWidth, selectorHeight, SHIP_RADIUS, this.hex2rgba(palette['pink'].hex, 0.8));                
    }

    hex2rgba(hex, alpha) {
        let r = parseInt(hex.slice(1,3), 16);
        let g = parseInt(hex.slice(3,5), 16);
        let b = parseInt(hex.slice(5,7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}