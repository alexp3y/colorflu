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
            case ' ':
                this.game.paused = (this.game.paused) ? false : true;
                event.preventDefault();
                break;
            case 'm':
            case 'M':
                this.game.board.bubbles.push(this.game.ship.spitBubble());
                break;
            case 'w':
            case 'W':
                this.game.ship.upGasOn = true;
                break;
            case 'a':
            case 'A': 
                this.game.ship.leftGasOn = true;
                break;
            case 's':
            case 'S':
                this.game.ship.downGasOn = true;
                break
            case 'd':
            case 'D':
                this.game.ship.rightGasOn = true;
                break;
            default:
                break;        
        }
    }

    handleKeyup(event) {
        switch (event.key) {
            case 'w':
            case 'W':
                this.game.ship.upGasOn = false;
                break;
            case 'a':
            case 'A': 
                this.game.ship.leftGasOn = false;
                break;
            case 's':
            case 'S':
                this.game.ship.downGasOn = false;
                break
            case 'd':
            case 'D':
                this.game.ship.rightGasOn = false;
                break;
            default:
            break;        
        }
    }

    handleMousedown(event) {
        this.game.board.addBubbleBurst(event.pageX, event.pageY);   
    }    
}