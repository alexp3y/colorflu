class Engine {
    constructor() {
        this.game = null,
        this.gameLoopId = null,
        this.refreshRate = 20,
        this.running = false
    }

    run() {
        if (!this.running) {
            if (this.game == null) {
                this.game = new Game();
            }
            this.running = true;
            
            this.gameLoopId = setInterval(() => {
                this.game.update();
                Graphics.renderGame(this.game);
            }, this.refreshRate);
        }
    }

    pause() {
        if (this.running) {
            this.running = false;
            clearInterval(this.gameLoopId);
        }
    }

    handleKeypress(event) {
        console.log(event.which);
        if (event.which == '32') {
            event.preventDefault();
            if (engine.running) {
                engine.pause();
            } else {
                engine.run();
            }
        } else {
            if (engine.running) this.game.handleKeypress(event);
        } 
    }

    handleMousedown(event) {
        if (engine.running) this.game.handleMousedown(event);
    }
}