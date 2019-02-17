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
                this.graphics.renderGame(this.game);
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
            let newBurst = engine.game.addBurst(event.pageX, event.pageY);
            engine.graphics.drawBurst(newBurst);
        }        
    }
}