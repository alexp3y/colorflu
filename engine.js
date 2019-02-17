class Engine {
    constructor() {
        this.game = new Game(),
        this.graphics = new Graphics(),
        this.gameLoopId = null,
        this.refreshRate = 20,
        this.running = false
    }

    run() {
        if (!this.running) {
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
            if (engine.running)  engine.pause();
            else engine.run();
        } else {
            this.game.handleKeypress(event);
        } 
    }

    handleMousedown(event) {
        if (engine.running) {
            engine.game.addBurst(event.pageX, event.pageY);
        }        
    }
}