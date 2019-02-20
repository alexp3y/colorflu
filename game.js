const SHIP_RADIUS = 25;
const SHIP_SPEED = 3;
const BLACK_BUBBLE_RADIUS = 8;
const COLOR_BUBBLE_RADIUS = 4;
const BUBBLES_PER_BURST = 50;

const palette = ['#f0582c',"#c2e57e","#5ce184","#3daae3","#5599de","#d63570","#d63570","#d63570"];


class Game {
    constructor(height, width) {
        this.board = new Board(height, width);
        this.ship = new Ship(200, 200),
        this.paused = false;
        this.score = 0;
    }
    updateGame() {
        if (!this.paused) {
            // bubbles
            this.board.bubbles.forEach((bubble, i) => {
                if (bubble.isCollidedWith(this.ship)) {
                    if (bubble.color != 'black') {
                        this.ship.eatBubble(this.board.bubbles.splice(i,1)[0]);
                        this.score++;
                    }
                } else if (bubble.isOutOfBounds()) {
                    this.board.bubbles.splice(i,1);
                    this.score--;
                } else {
                    bubble.move();
                }
            });
            // ship
            this.ship.updateVelocity();
            this.ship.enforceBoundary(this.board.h, this.board.w);
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
        if (posNeg() > 0){
            // black and white
            for (let i=0; i<BUBBLES_PER_BURST; i++) {
                this.bubbles.push(new Bubble(x, y, BLACK_BUBBLE_RADIUS, 'black'));
            }
        } else {
            // color
            for (let i=0; i<BUBBLES_PER_BURST; i++) {
                this.bubbles.push(new Bubble(x, y, COLOR_BUBBLE_RADIUS/1., randomColor()));
            }
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
    constructor(x, y, r, color) {
        super(x, y, randomVelocity(), randomVelocity());
        this.r = r,
        this.color = color;
    }
    isOutOfBounds(h,w) {
        return (this.x+this.r < 0 || this.x-this.r > w
            || this.y+this.r < 0 || this.y-this.r > h) 
        ? true 
        : false
    }
    isCollidedWith(ship) {
        return distance(this, ship) <= (this.r + ship.r);
    }
}


class Ship extends MovableElement {
    constructor(x, y) {
        super(x, y, 0, 0);
        this.r = SHIP_RADIUS,
        this.color = 'black',
        this.upGasOn = false,
        this.downGasOn = false,
        this.leftGasOn = false,
        this.rightGasOn = false,
        this.bubbles = [];
    }
    updateVelocity() {
        if (this.upGasOn) {
            this.yVel = (this.downGasOn) ? 0 : -SHIP_SPEED;
        } else {
            this.yVel = (this.downGasOn) ? SHIP_SPEED : 0;
        }
        if (this.rightGasOn) {
            this.xVel = (this.leftGasOn) ? 0 : SHIP_SPEED;
        } else {
            this.xVel = (this.leftGasOn) ? -SHIP_SPEED : 0;
        }
    }
    enforceBoundary(h,w) {
        if (this.x-this.r <= 0 && this.xVel < 0) this.xVel = 0; // left wall
        if (this.x+this.r >= w && this.xVel > 0) this.xVel = 0; // right wall
        if (this.y-this.r <= 0 && this.yVel < 0) this.yVel = 0; // top wall
        if (this.y+this.r >= h && this.yVel > 0) this.yVel = 0; // bottom wall
    }    
    spitBubble() {
        let ejected = this.bubbles.pop();
        if (ejected) {
            ejected.y = this.y;
            ejected.x = this.x + this.r + ejected.r + 1;
            ejected.xVel = SHIP_SPEED;
        }
        return ejected;
    }
    eatBubble(bubble) {
        this.bubbles.push(bubble);
    }
}


const posNeg = () => Math.random() < 0.5 ? -1 : 1;
const randomVelocity = () => Math.random() * posNeg() / 2;
const randomColor = () => palette[Math.floor(Math.random() * palette.length)];
const distance = (p, q) => { 
    var dx   = p.x - q.x;         
    var dy   = p.y - q.y;         
    var dist = Math.sqrt( dx*dx + dy*dy ); 
    return dist;
}