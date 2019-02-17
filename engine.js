function Engine() {
    this.game = new Game(),
    this.graphics = new Graphics(),
    this.gameLoopId = null,
    this.refreshRate = 20,
    this.running = false,
    this.turnOn = function() {
        if (!this.running) {
            this.running = true;
            this.gameLoopId = setInterval(() => {
                this.game.update();
                this.graphics.renderGame(this.game);
            }, this.refreshRate);
        }
    },
    this.pause = function() {
        if (this.running) {
            this.running = false;
            clearInterval(this.gameLoopId);
        }
    }
}