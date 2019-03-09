const REFRESH_RATE = 20; //ms
const palette = {
    red: {
        hex: '#e22b2b',
        powerLvl: 1 
    },
    pink: { 
        hex: '#f28cb8',
        powerLvl: 2
    },
    darkBlue: {
        hex: '#254b8a',
        powerLvl: 3
    },
    orange: {
        hex: '#fca420',
        powerLvl: 4
    },
    yellow: {
        hex: '#fde02a',
        powerLvl: 5
    },
    purple: {
        hex: '#390f59',
        powerLvl: 7
    },
    blue: {
        hex: '#1627cf',
        powerLvl: 8
    },
    green: {
        hex: '#53a678',
        powerLvl: 9
    },
    maroon: {
        hex: '#ac2a62',
        powerLvl: 10
    }
}

class Engine {
    constructor() {
        this.game = null,
        this.graphics = null,
        this.intervalId = null,
        this.on = false;
    }

    turnOn(height, width) {
        if (!this.on) {
            this.on = true;
            this.game = new Game(height, width);
            this.graphics = new Graphics(height, width, this.game);
            this.gameLoopId = setInterval(() => {
                this.gameLoop();
            }, REFRESH_RATE);
        }
        window.requestAnimationFrame(render);
    }

    gameLoop() {
        if (this.game.menu.restartSignal) {
            this.game.menu.restartSignal = false;
            // if (this.game.paused) {
                this.game = new Game(this.game.board.h, this.game.board.w);
            // }
            this.game.titleOn = false;
        } else if (this.game.menu.unpauseSignal) {
            this.game.paused = false;
            this.game.menu.unpauseSignal = false;
        } else if (this.game.ship.isDestroyed()) {
            this.game.titleOn = true;
        }
        this.game.updateGame();
    }
    
    handleKeydown(event) {
        switch (event.key) {
            case ' ':
                if (!this.game.titleOn) {
                    this.game.paused = (this.game.paused) ? false : true;
                }
                event.preventDefault();
                break;
            case 'w':
            case 'W':
                this.game.ship.upTriggerOn = true;
                break;
            case 'a':
            case 'A': 
                this.game.ship.leftTriggerOn = true;
                break;
            case 's':
            case 'S':
                this.game.ship.downTriggerOn = true;
                break
            case 'd':
            case 'D':
                this.game.ship.rightTriggerOn = true;
                break;
            case 'ArrowUp':
                if (this.game.paused || this.game.titleOn) {
                    this.game.menu.moveSelectedUp(this.game.paused);
                } else {
                    this.game.ship.upGasOn = true;
                }
                event.preventDefault();
                break;
            case 'ArrowLeft': 
                this.game.ship.leftGasOn = true;
                event.preventDefault();
                break;
            case 'ArrowDown': 
                if (this.game.paused || this.game.titleOn) {
                    this.game.menu.moveSelectedDown();
                } else {
                    this.game.ship.downGasOn = true;
                }
                event.preventDefault();
                break
            case 'ArrowRight': 
                this.game.ship.rightGasOn = true;
                event.preventDefault();
                break;        
            case 'Enter':
                if (this.game.paused || this.game.titleOn) {
                    this.game.menu.executeSelected(this.game.paused);
                }
                break;
            default:
                break;        
        }
    }

    handleKeyup(event) {
        switch (event.key) {
            case 'w':
            case 'W':
                this.game.ship.upTriggerOn = false;
                break;
            case 'a':
            case 'A': 
                this.game.ship.leftTriggerOn = false;
                break;
            case 's':
            case 'S':
                this.game.ship.downTriggerOn = false;
                break
            case 'd':
            case 'D':
                this.game.ship.rightTriggerOn = false;
                break;
            case 'ArrowUp': 
                this.game.ship.upGasOn = false;
                break;
            case 'ArrowLeft': 
                this.game.ship.leftGasOn = false;
                break;
            case 'ArrowDown': 
                this.game.ship.downGasOn = false;
                break
            case 'ArrowRight': 
                this.game.ship.rightGasOn = false;
                break;               
            default:
                break;        
        }
    }

    handleMousedown(event) {
        if (!this.game.paused && !this.game.titleOn) {
            this.game.board.addEnemyBurst(event.pageX, event.pageY);   
        }
    }    
}