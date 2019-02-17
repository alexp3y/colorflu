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
        this.ship.move();
        this.bursts.forEach(burst => {
            burst.bubbles.forEach(bubble => {
                bubble.move();
                // checkShip
            });
        });
    }

    handleKeypress(event) {
        console.log('game got it')    
    }

    handleMousedown(event) {
        this.addBurst(event.pageX, event.pageY);        
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
            new Bubble(`${this.id}-${this.bubbles.length}`, this.xPos, this.yPos));
    }
}


class ScreenElement {
    constructor(id, height, width, xPos, yPos, xVel, yVel, color, type) {
        this.id = id,
        this.height = height,
        this.width = width,
        this.xPos = xPos,
        this.yPos = yPos,
        this.xVel = xVel,
        this.yVel = yVel,
        this.color = color;
        
        Graphics.addElement(this, type)
    }
    
    move() {
        this.xPos += this.xVel;
        this.yPos += this.yVel;
    }
}
    

class Bubble extends ScreenElement {
    constructor(id, xPos, yPos) {
        super(id, 8, 8, xPos, yPos, randomVelocity(), randomVelocity(), randomColor(), 'bubble');
    }
}


class Ship extends ScreenElement {
    constructor(xPos, yPos) {
        super('ship1', 10, 5, xPos, yPos, 0, 0, randomColor(), 'ship');
    }
}

function areElementsCollided(e1, e2) {
    // check x collision distance

}


const posNeg = () => Math.random() < 0.5 ? -1 : 1;
const randomVelocity = () => Math.random() * posNeg() / 2;
const randomColor = () => Math.floor(Math.random()*16777215).toString(16);