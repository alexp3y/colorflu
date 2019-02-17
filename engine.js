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
}