const SHIP_HEIGHT = 50;
const SHIP_WIDTH = 30;

const BUBBLE_RADIUS = 8;
const BUBBLES_PER_BURST = 50;

const SHIP_SPEED = 3;

class Game {
    constructor(height, width) {
        this.board = new Board(height, width);
        this.ship = new Ship(200, 200),
        this.paused = false;
        this.score = 0;
    }
    updateGame() {
        if (!this.paused) {
            // update bubbles
            this.board.bubbles.forEach((bubble, i) => {
                if (areElementsCollided(this.ship, bubble)) {
                    this.ship.eatBubble(this.board.bubbles.splice(i,1));
                    this.score++;
                } else if (bubble.isOutOfBounds()) {
                    this.board.bubbles.splice(i,1);
                    this.score--;
                } else {
                    bubble.move();
                }
            });
            // update ship
            this.ship.updateVelocity();
            this.ship.enforceBoundary();
            this.ship.move();
        }
    }
}


class Board {
    constructor (h, w) {
        this.h = h,
        this.w = w,
        this.bubbles = []
    }
    addBubbleBurst(x, y) {
        for (let i=0; i<BUBBLES_PER_BURST; i++) {
            this.bubbles.push(new Bubble(x, y));
        }
    }    
}


class MovableElement {
    constructor(x, y, xVel, yVel) {
        this.x = x,
        this.y = y,
        this.xVel = xVel,
        this.yVel = yVel;
    }
    move() {
        this.x += this.xVel;
        this.y += this.yVel;
    }
}
    

class Bubble extends MovableElement {
    constructor(x, y) {
        super(x, y, randomVelocity(), randomVelocity());
        this.r = BUBBLE_RADIUS;
        this.color = randomColor();
    }
    isOutOfBounds(h,w) {
        return (this.x+this.r < 0 || this.x-this.r > w
            || this.y+this.r < 0 || this.y-this.r > h) 
        ? true 
        : false
    }
}


class Ship extends MovableElement {
    constructor(x, y) {
        super(x, y, 0, 0);
        this.h = SHIP_HEIGHT,
        this.w = SHIP_WIDTH,
        this.color = randomColor(),
        this.upGas = false,
        this.downGas = false,
        this.leftGas = false,
        this.rightGas = false;
    }
    updateVelocity() {
        // y velocity
        if (this.upGas) {
            this.yVel = (this.downGas) ? 0 : -SHIP_SPEED;
        } else {
            this.yVel = (this.downGas) ? SHIP_SPEED : 0;
        }
        // x velocity
        if (this.rightGas) {
            // right gas on
            this.xVel = (this.leftGas) ? 0 : SHIP_SPEED;
        } else {
            this.xVel = (this.leftGas) ? -SHIP_SPEED : 0;
        }
    }
    eatBubble(bubble) {
        this.color = bubble.color;
    }
    enforceBoundary(h,w) {
        // left wall
        if (this.x <= 0 && this.xVel < 0) this.xVel = 0; 
        // right wall
        if (this.x+this.width >= w && this.xVel > 0) this.xVel = 0;
        // top wall
        if (this.y <= 0 && this.yVel < 0) this.yVel = 0;
        // bottom wall
        if (this.y+this.height >= h && this.yVel > 0) this.yVel = 0;
    }    
}


function areElementsCollided(e1, e2) {
    // check x collision distance
    let xCollisionRange = (e1.x < e2.x) ? e1.width : e2.width;
    let xDist = Math.abs(e1.x - e2.x);
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