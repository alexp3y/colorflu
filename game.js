const posNeg = () => Math.random() < 0.5 ? -1 : 1;
const randomVelocity = () => Math.random() * posNeg() / 2;

class Game {
    constructor() {
        this.ship = new Ship(200, 200),
        this.bursts = [];
    }
    
    addBurst(xPos, yPos) {
        let burst = new Burst(this.bursts.length + 1, xPos, yPos, 50);
        this.bursts.push(burst);
        return burst;
    }

    update() {
        this.bursts.forEach(burst => {
            burst.bubbles.forEach(bubble => {
                bubble.move();
            });
        });
    }

    handleKeypress(event) {
        if (event.which == '32') {
            event.preventDefault();
            if (engine.running)  engine.pause();
            else engine.run();
        }        
    }
}

class ScreenElement {
    constructor(id, xPos, yPos, xVel, yVel) {
        this.id = id,
        this.xPos = xPos,
        this.yPos = yPos,
        this.xVel = xVel,
        this.yVel = yVel
    }
    
    move() {
        this.xPos += this.xVel;
        this.yPos += this.yVel;
    }
}

class Burst {
    constructor (id, xPos, yPos, bubbleCount) {
        this.id = id,
        this.xPos = xPos,
        this.yPos = yPos,
        this.bubbles = []

        for (let i=0; i<bubbleCount; i++) {
            this.addBubble();
        }
    }
    
    addBubble() {
        this.bubbles.push(
            new Bubble(this.bubbles.length, this.xPos, this.yPos));
    }
}
    
class Bubble extends ScreenElement {
    constructor(id, xPos, yPos) {
        super(id, xPos, yPos, randomVelocity(), randomVelocity());
    }
}

class Ship extends ScreenElement {
    constructor(xPos, yPos) {
        super(1, xPos, yPos, 0, 0);
    }
}