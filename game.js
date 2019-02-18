const SHIP_HEIGHT = 50;
const SHIP_WIDTH = 30;

const BUBBLE_DIAMETER = 8;
const BUBBLES_PER_BURST = 50;

const MAX_SPEED = 3;

class Game {
    constructor() {
        this.ship = new Ship(200, 200),
        this.bursts = [];
    }

    updateGame() {
        // update bursts
        this.bursts.forEach((burst, i) => {
            burst.bubbles.forEach((bubble, i) => {
                if (areElementsCollided(this.ship, bubble)) {
                    this.ship.eatBubble(burst.removeBubble(i));
                } else {
                    bubble.move();
                }
            });
            if (burst.bubbles.length == 0) this.removeBurst(i);
        });
        // move ship
        this.ship.move();
    }
    
    addBurst(xPos, yPos) {
        let burst = new Burst(this.bursts.length + 1, xPos, yPos, BUBBLES_PER_BURST);
        this.bursts.push(burst);
        return burst;
    }

    removeBurst(index) {
        this.bursts.splice(index, 1);
    }

    handleKeydown(event) {
        switch (event.key) {
            case 'w':
            case 'W':
                this.ship.upGas = true;
                break;
            case 'a':
            case 'A': 
                this.ship.leftGas = true;
                break;
            case 's':
            case 'S':
                this.ship.downGas = true;
                break
            case 'd':
            case 'D':
                this.ship.rightGas = true;
                break;
            default:
                break;        
        }
        this.ship.updateVelocity();
    }

    handleKeyup(event) {
        switch (event.key) {
            case 'w':
            case 'W':
                this.ship.upGas = false;
                break;
            case 'a':
            case 'A': 
                this.ship.leftGas = false;
                break;
            case 's':
            case 'S':
                this.ship.downGas = false;
                break
            case 'd':
            case 'D':
                this.ship.rightGas = false;
                break;
            default:
            break;        
        }
        this.ship.updateVelocity();
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
        let newBubble = new Bubble(`${this.id}-${this.bubbles.length}`, this.xPos, this.yPos);
        console.log(newBubble.id + ': ' + newBubble.color);
        this.bubbles.push(newBubble);
    }
    removeBubble(i) {
        let bubble = this.bubbles.splice(i, 1)[0];
        bubble.destroy();
        return bubble;
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
    destroy() {
        Graphics.removeElement(this);
    }
}
    

class Bubble extends ScreenElement {
    constructor(id, xPos, yPos) {
        super(id, BUBBLE_DIAMETER, BUBBLE_DIAMETER, xPos, yPos, randomVelocity(), 
                randomVelocity(), randomColor(), 'bubble');
    }
}


class Ship extends ScreenElement {
    constructor(xPos, yPos) {
        super('ship1', SHIP_HEIGHT, SHIP_WIDTH, xPos, yPos, 0, 0, randomColor(), 'ship');
        this.upGas = false,
        this.downGas = false,
        this.leftGas = false,
        this.rightGas = false;
    }

    updateVelocity() {
        // y velocity
        if (this.upGas) {
            this.yVel = (this.downGas) ? 0 : -MAX_SPEED;
        } else {
            this.yVel = (this.downGas) ? MAX_SPEED : 0;
        }
        // x velocity
        if (this.rightGas) {
            // right gas on
            this.xVel = (this.leftGas) ? 0 : MAX_SPEED;
        } else {
            this.xVel = (this.leftGas) ? -MAX_SPEED : 0;
        }
    }
    
    eatBubble(bubble) {
        this.color = bubble.color;
    }
}


function areElementsCollided(e1, e2) {
    // check x collision distance
    let xCollisionRange = (e1.xPos < e2.xPos) ? e1.width : e2.width;
    let xDist = Math.abs(e1.xPos - e2.xPos);
    if (xDist < xCollisionRange) {
        // check y collision distance
        let yCollisionRange = (e1.yPos < e2.yPos) ? e1.height : e2.height;
        let yDist = Math.abs(e1.yPos - e2.yPos);
        if (yDist < yCollisionRange) {
            return true;
        }
    }
    return false;
}


const posNeg = () => Math.random() < 0.5 ? -1 : 1;
const randomVelocity = () => Math.random() * posNeg() / 2;
const randomColor = () => {
    let rgbHex = Math.floor(Math.random()*15728640).toString(16);
    return rgbHex.padStart(6, '0');
}