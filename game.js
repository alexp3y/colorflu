const SHIP_RADIUS = 25;
const BLACK_BUBBLE_RADIUS = 8;
const COLOR_BUBBLE_RADIUS = 5;

const SHIP_VELOCITY = 3;
const BULLET_VELOCITY = 4;

const SHIP_TRIGGER_DELAY = 3;
const BUBBLES_PER_BURST = 50;

const palette = ['#f0582c',"#c2e57e","#5ce184","#3daae3","#5599de","#d63570","#d63570","#d63570"];


class Game {
    constructor(height, width) {
        this.board = new Board(height, width);
        this.ship = new Ship(200, 200),
        this.paused = false,
        this.loopCounter = 0,
        this.score = 0;
    }
    updateGame() {
        this.loopCounter++;
        if (this.loopCounter > 12) this.loopCounter = 1;  // 12 lets us do delayed effects at modulo 2, 3, 4, 6, 12
        
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
            if (this.isDelayReady(SHIP_TRIGGER_DELAY)) {
                this.board.addBullets(this.ship.spitBubbles());
            }
                // ship
            this.ship.updateVelocity();
            this.ship.enforceBoundary(this.board.h, this.board.w);
            this.ship.move();
        }
    }
    isDelayReady(delay) {
        return this.loopCounter%delay == 0;
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
    addBullets(bullets) {
        bullets.forEach(b => this.bullets.push(b));
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
        this.upTriggerOn = false,
        this.downTriggerOn = false,
        this.leftTriggerOn = false,
        this.rightTriggerOn = false,
        this.upGasOn = false,
        this.downGasOn = false,
        this.leftGasOn = false,
        this.rightGasOn = false,
        this.bubbles = [];
    }
    updateVelocity() {
        if (this.upGasOn) {
            this.yVel = (this.downGasOn) ? 0 : -SHIP_VELOCITY;
        } else {
            this.yVel = (this.downGasOn) ? SHIP_VELOCITY : 0;
        }
        if (this.rightGasOn) {
            this.xVel = (this.leftGasOn) ? 0 : SHIP_VELOCITY;
        } else {
            this.xVel = (this.leftGasOn) ? -SHIP_VELOCITY : 0;
        }
    }
    enforceBoundary(h,w) {
        if (this.x-this.r <= 0 && this.xVel < 0) this.xVel = 0; // left wall
        if (this.x+this.r >= w && this.xVel > 0) this.xVel = 0; // right wall
        if (this.y-this.r <= 0 && this.yVel < 0) this.yVel = 0; // top wall
        if (this.y+this.r >= h && this.yVel > 0) this.yVel = 0; // bottom wall
    }    
    eatBubble(bubble) {
        bubble.r = COLOR_BUBBLE_RADIUS;
        this.bubbles.push(bubble);
    }
    spitBubbles() {
        let spitBubbles = [];
        if (this.bubbles.length > 0 && this.upTriggerOn) {
            let spitUp = this.bubbles.pop();
            spitUp.yVel = -BULLET_VELOCITY;
            spitBubbles.push(spitUp);
        }
        if (this.bubbles.length > 0 && this.downTriggerOn) {
            let spitDown = this.bubbles.pop();
            spitDown.yVel = BULLET_VELOCITY;
            spitBubbles.push(spitDown);
        }
        if (this.bubbles.length > 0 && this.leftTriggerOn) {
            let spitLeft = this.bubbles.pop();
            spitLeft.xVel = -BULLET_VELOCITY;
            spitBubbles.push(spitLeft);
        }
        if (this.bubbles.length > 0 && this.rightTriggerOn) {
            let spitRight = this.bubbles.pop();
            spitRight.xVel = BULLET_VELOCITY;
            spitBubbles.push(spitRight);
        }
        spitBubbles.forEach(s => {
            s.bullet = true;
            s.x = this.x;
            s.y = this.y;
        });
        return spitBubbles;
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