const REFRESH_RATE = 20;

class Engine {
    constructor() {
        this.game = null,
        this.gameLoopId = null,
        this.refreshRate = REFRESH_RATE,
        this.running = false;
    }

    newGame(boardWidth, boardHeight) {
        this.game = new Game(boardWidth, boardHeight);
    }

    run() {
        if (!this.running) {
            this.running = true;
            this.gameLoopId = setInterval(() => {
                // game loop //
                this.game.updateGame();
                Graphics.renderGame(this.game);
                ////
            }, this.refreshRate);
            Graphics.togglePause(this.game.ship.color);
        }
    }

    pause() {
        if (this.running) {
            this.running = false;
            clearInterval(this.gameLoopId);
            Graphics.togglePause(this.game.ship.color);
        }
    }

    handleKeypress(event) {
        if (event.which == '32') {
            event.preventDefault();
            if (engine.running) {
                engine.pause();
            } else {
                engine.run();
            }
        }
    }

    handleKeydown(event) {
        this.game.handleKeydown(event);
    }

    handleKeyup(event) {
        this.game.handleKeyup(event);
    }

    handleMousedown(event) {
        if (engine.running) this.game.handleMousedown(event);
    }
}