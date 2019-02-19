const REFRESH_RATE = 20; //ms

class Engine {
    constructor() {
        this.game = null,
        this.intervalId = null,
        this.on = false;
    }

    turnOn(height, width) {
        if (!this.on) {
            this.on = true;
            this.game = new Game(height, width);
            this.graphics = new Graphics(height, width, this.game);
            this.gameLoopId = setInterval(() => {
                // game loop //
                this.game.updateGame();
                this.graphics.renderGame();
                ////
            }, REFRESH_RATE);
        }
    }

    turnOff() {
        if (this.on) {
            this.on = false;
            clearInterval(this.intervalId);
        }
    }

    handleKeydown(event) {
        switch (event.key) {
            case '32':
                this.game.paused = (this.game.paused) ? false : true;
                event.preventDefault();
                break;
            case 'w':
            case 'W':
                this.game.ship.upGas = true;
                break;
            case 'a':
            case 'A': 
                this.game.ship.leftGas = true;
                break;
            case 's':
            case 'S':
                this.game.ship.downGas = true;
                break
            case 'd':
            case 'D':
                this.game.ship.rightGas = true;
                break;
            default:
                break;        
        }
    }

    handleKeyup(event) {
        switch (event.key) {
            case 'w':
            case 'W':
                this.game.ship.upGas = false;
                break;
            case 'a':
            case 'A': 
                this.game.ship.leftGas = false;
                break;
            case 's':
            case 'S':
                this.game.ship.downGas = false;
                break
            case 'd':
            case 'D':
                this.game.ship.rightGas = false;
                break;
            default:
            break;        
        }
    }

    handleMousedown(event) {
        this.game.board.addBubbleBurst(event.pageX, event.pageY);        
    }    
}