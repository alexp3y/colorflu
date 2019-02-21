const SHIP_RADIUS = 25;
const SHIP_SPEED = 3;
const SHIP_FIRE_DELAY = 2;
const BLACK_BUBBLE_RADIUS = 8;
const COLOR_BUBBLE_RADIUS = 5   ;
const BUBBLES_PER_BURST = 50;

const palette = ['#f0582c',"#c2e57e","#5ce184","#3daae3","#5599de","#d63570","#d63570","#d63570"];


class Game {
    constructor(height, width) {
        this.board = new Board(height, width);
        this.ship = new Ship(200, 200),
        this.paused = false;
        this.score = 0,
        this.shipFireCounter = SHIP_FIRE_DELAY;
    }
    updateGame() {
        if (!this.paused) {
            // bubbles
            this.board.bubbles.forEach((bubble, i) => {
                if (bubble.color != 'black') {
                    if (bubble.isCollidedWith(this.ship)) {
                        this.ship.eatBubble(this.board.bubbles.splice(i,1)[0]);
                        this.score++;
                        return;
                    }
                } else {
                    this.board.bullets.forEach((bullet, j) => {
                        if (bullet.isCollidedWith(bubble)) {
                            bubble.color = bullet.color;
                            this.board.bullets.splice(j,1);
                        }
                    });
                }
                if (bubble.isOutOfBounds()) {
                    this.board.bubbles.splice(i,1);
                    this.score--;
                } else {
                    bubble.move();
                }
            });
            // bullets
            this.board.bullets.forEach(b => b.move());
            // ship
            if (this.ship.triggerOn) {
                if (this.shipFireCounter == SHIP_FIRE_DELAY) {
                    let spitBubble = this.ship.spitBubble();
                    if (spitBubble) this.board.bullets.push(spitBubble);
                    this.shipFireCounter = 0;
                } else {
                    this.shipFireCounter++;
                }
            }
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
        this.bubbles = [],
        this.bullets = [];
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
        this.color = color,
        this.bullet = false;
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
        this.triggerOn = false,
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
        if (this.bubbles.length > 0) {
            let ejected = this.bubbles.pop();
            ejected.bullet = true;
            ejected.y = this.y;
            ejected.x = this.x + this.r + ejected.r + 1;
            ejected.xVel = SHIP_SPEED + .5;
            return ejected;
        }
    }
    eatBubble(bubble) {
        bubble.r = COLOR_BUBBLE_RADIUS;
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