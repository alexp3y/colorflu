const palette = {
    black: {
        hex: '#ffffff',
        powerLvl: 0 
    },
    red: {
        name: 'red',
        hex: '#e22b2b',
        powerLvl: 1 
    },
    pink: { 
        name: 'pink',
        hex: '#f28cb8',
        powerLvl: 2
    },
    darkBlue: {
        name: 'darkBlue',
        color: '#254b8a',
        powerLvl: 3
    },
    orange: {
        name: 'orange',
        hex: '#fca420',
        powerLvl: 4
    },
    yellow: {
        name: 'yellow',
        hex: '#fde02a',
        powerLvl: 5
    },
    lightPurple: {
        name: 'lightPurple',
        hex: '#e3dff7',
        powerLvl: 6
    },
    purple: {
        name: 'purple', 
        hex: '#390f59',
        powerLvl: 7
    },
    blue: {
        name: 'blue', 
        hex: '#1627cf',
        powerLvl: 8
    },
    green: {
        name: 'green',
        hex: '#53a678',
        powerLvl: 9
    },
    maroon: {
        name: 'maroon',
        hex: '#ac2a62',
        powerLvl: 10
    }
}

// Radii
const SHIP_RADIUS = 35;
const ENEMY_RADIUS = 8;
const AMMO_RADIUS = 5;
const BULLET_RADIUS = 2;
const ENEMY_BURST_RADIUS = 200;
const AMMO_BURST_RADIUS = 100;

const BUBBLES_PER_BURST = 50;

// Velocities
const SHIP_VELOCITY = 3;
const BULLET_VELOCITY = 4;
const SCROLL_ADJUST_VELOCITY = 2;

const GRADIENT_OFFSET = 100;

// Clock Delays
const SHIP_TRIGGER_DELAY = 3;
const SCROLL_DELAY = 6;


class Game {
    constructor(height, width) {
        this.board = new Board(height, width);
        this.ship = new Ship(this.board.leftScrollWall+SHIP_RADIUS, height/2 ),
        this.paused = false,
        this.loopCounter = 0;
    }
    updateGame() {
        this.incrementLoopCounter();

        if (!this.paused) {
            // scrolling
            let scrollAdjust = 0, scrollBlock = false;
            if (this.ship.x+this.ship.r >= this.board.rightScrollWall && this.ship.rightGasOn) {
                if (this.isDelayReady(SCROLL_DELAY)) {
                    this.board.increaseGradient();
                }
                scrollAdjust = -SCROLL_ADJUST_VELOCITY;
            } else if (this.ship.x-this.ship.r <= this.board.leftScrollWall && this.ship.leftGasOn) {
                if (this.isDelayReady(SCROLL_DELAY)) {
                    this.board.decreaseGradient();
                }
                scrollAdjust = SCROLL_ADJUST_VELOCITY;
            } 

            // enemy bursts
            this.board.enemyBursts.forEach((burst, i) => {
                burst.bubbles.forEach((enemy, j) => {
                    if (enemy.isCollidedWith(this.ship)) { // check ship colission
                        // ship die...
                        // this.board.enemyBursts[i].bubbles.splice(j,1);
                    } else if (this.board.isElementOutOfBounds(enemy)) { // boundary check
                        this.board.enemyBursts[i].bubbles.splice(j,1);
                    } else {
                        this.board.bullets.forEach((bullet, k) => {  // check bullet colissions
                            if (enemy.isCollidedWith(bullet)) {
                                // enemy die...
                                this.board.enemyBursts[i].bubbles.splice(j,1);
                                this.board.bullets.splice(k,1);
                            }
                        });
                    }
                });
                if (burst.bubbles.length == 0) this.board.enemyBursts.splice(i,1);
                else if (burst.isAtMaxRadius()) burst.reverseBurstDirection();
            });
            
            // ammo bursts
            this.board.ammoBursts.forEach((burst, i) => {
                burst.bubbles.forEach((ammo, j) => {
                    if (ammo.isCollidedWith(this.ship)) {
                        this.ship.pickupAmmo(this.board.ammoBursts[i].bubbles.splice(j,1)[0]);
                    } else if (this.board.isElementOutOfBounds(ammo)) {
                        this.board.ammoBursts[i].bubbles.splice(j,1);
                    }
                });
                if (burst.bubbles.length == 0) this.board.ammoBursts.splice(i,1);
            });

            // adjust ship
            this.ship.applyGas();
            this.board.enforceShipBoundary(this.ship);
            if (this.isDelayReady(SHIP_TRIGGER_DELAY) && this.ship.isShooting()) {
                this.board.bullets.push(this.ship.shootBullet());
            }
            
            // move all elements with their current vel (plus any detected scroll adjustment)
            this.moveGameElements(scrollAdjust);
        }
    }
    incrementLoopCounter() {
        this.loopCounter++;
        if (this.loopCounter > 12) this.loopCounter = 1;  // 12 lets us do delayed effects at modulo 2, 3, 4, 6, 12
    }
    isDelayReady(delay) {
        return this.loopCounter%delay == 0;
    }
    moveGameElements(scrollAdjust) {
        this.board.enemyBursts.forEach(burst => burst.bubbles.forEach(b => b.move(scrollAdjust)));
        this.board.ammoBursts.forEach(burst => burst.bubbles.forEach(b => b.move(scrollAdjust)));
        this.board.bullets.forEach(b => b.move(scrollAdjust));
        this.ship.move(0);
    }
}


class Board {
    constructor (h, w) {
        this.enemyBursts = [],
        this.ammoBursts = [],
        this.bullets = [],
        this.h = h,
        this.w = w,
        this.leftBoundary = -this.w/2,
        this.rightBoundary = this.w*1.5,
        this.topBoundary = -this.h/2,
        this.bottomBoundary = this.h*1.5,
        this.leftScrollActive = false,
        this.rightScrollActive = true,
        this.leftScrollWall = this.w/3,
        this.rightScrollWall = this.w*3/5,
        this.leftShade = 255,
        this.rightShade = 255 - GRADIENT_OFFSET,
        this.foregroundShade = 0;
    }
    isElementOutOfBounds(el) {
        return (el.x < this.leftBoundary) || (el.x > this.rightBoundary) ||
                (el.y < this.topBoundary) || (el.y > this.bottomBoundary) ? true : false;
    }
    enforceShipBoundary(ship) {
        let leftBound = (this.leftScrollActive) ? this.leftScrollWall : 0;
        let rightBound = (this.rightScrollActive) ? this.rightScrollWall : this.w;
        if (ship.x-ship.r <= leftBound) ship.xVel = 0;
        if (ship.x+ship.r >= rightBound) ship.xVel = 0; 
        if (ship.y-ship.r <= 0) ship.yVel = 0;
        if (ship.y+ship.r >= this.h) ship.yVel = 0;
    }
    addAmmoBurst(x, y) {
        let ammoBurst = new Burst(x, y, AMMO_BURST_RADIUS);
        for (let i=0; i<BUBBLES_PER_BURST; i++) {
            ammoBurst.bubbles.push(new Ammo(x, y));
        }
        this.ammoBursts.push(ammoBurst);
    }
    addEnemyBurst(x, y) {
        let enemyBurst = new Burst(x, y, ENEMY_BURST_RADIUS);
        for (let i=0; i<BUBBLES_PER_BURST; i++) {
            enemyBurst.bubbles.push(new Enemy(x, y));
        }
        this.enemyBursts.push(enemyBurst);
    }
    increaseGradient() {
        if (this.leftWallShade - this.rightWallShade > GRADIENT_OFFSET || this.rightWallShade == 0) {
            if (this.leftWallShade > 0) this.leftWallShade--;
        }
        if (this.rightWallShade > 0) this.rightWallShade--;
    }
    decreaseGradient() {
        if (this.leftWallShade > GRADIENT_OFFSET) {
            if (this.rightWallShade < 255) this.rightWallShade++;
        } 
        if (this.leftWallShade < 255) this.leftWallShade++;
    }
}


class Burst {
    constructor(x, y, r, maxRadius) {
        this.x = x,
        this.y = y,
        this.r = r,
        this.maxRadius = maxRadius,
        this.bubbles = []
    }
    isAtMaxRadius() {
        for (let i=0; i<this.bubbles.length; i++) {
            if (distance(this, this.bubbles[i]) > this.maxRadius) return true;
        }
        return false;
    }
    reverseBurstDirection() {
        this.bubbles.forEach(b => {
            b.xVel *= -1;
            b.yVel *= -1;
        })
    }
}


class MovableElement {
    constructor(x, y, r, xVel, yVel, color) {
        this.x = x,
        this.y = y,
        this.r = r,
        this.xVel = xVel,
        this.yVel = yVel, 
        this.color = color;
    }
    move(scrollAdjust) {
        this.x += this.xVel+scrollAdjust;
        this.y += this.yVel;
    }
    isCollidedWith(element) {
        return distance(this, element) <= (this.r + element.r);
    }    
}
   

class Bubble extends MovableElement {
    constructor(x, y, r, color) {
        super(x, y, r, randomVelocity(), randomVelocity(), color);
    }
}


class Bullet extends Bubble {
    constructor(x, y, radius, color) {
        super(x, y, radius, color);
    }
}


class Ammo extends Bubble {
    constructor(x, y) {
        super(x, y, AMMO_RADIUS, randomColor());
    }
}


class Enemy extends Bubble {
    constructor(x, y) {
        super(x, y, ENEMY_RADIUS, 'black');
    }
}


class Ship extends MovableElement {
    constructor(x, y) {
        super(x, y, SHIP_RADIUS, 0, 0, 'black');
        this.upTriggerOn = false,
        this.downTriggerOn = false,
        this.leftTriggerOn = false,
        this.rightTriggerOn = false,
        this.upGasOn = false,
        this.downGasOn = false,
        this.leftGasOn = false,
        this.rightGasOn = false,
        this.ammo = {}
        // initialize ammo array using palette colors
        Object.keys(palette).forEach(color => this.ammo[color] = 0);
    }
    applyGas() {
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
    pickupAmmo(bubble) {
        this.ammo[bubble.color]++;
    }
    isShooting() {
        return ((this.leftTriggerOn && !this.rightTriggerOn) ||
                (this.rightTriggerOn && !this.leftTriggerOn) ||
                (this.upTriggerOn && !this.downTriggerOn) ||
                (this.downTriggerOn && !this.upTriggerOn)) ? true : false; 
    }
    shootBullet() {
        // select the highest power ammo available
        let selected = 'red';
        Object.keys(this.ammo).forEach(a => { 
            if (this.ammo[a] > 0 && palette[a].powerLvl > palette[selected].powerLvl) {
                selected = a;
            }
        });
        let bullet = new Bullet(this.x, this.y, palette[selected].powerLvl, selected);
        this.ammo[selected]--;
        if (this.upTriggerOn) {
            bullet.yVel -= BULLET_VELOCITY;
        }
        if (this.downTriggerOn) {
            bullet.yVel += BULLET_VELOCITY;
        }
        if (this.leftTriggerOn) {
            bullet.xVel -= BULLET_VELOCITY;
        }
        if (this.rightTriggerOn) {
            bullet.xVel += BULLET_VELOCITY;
        }
        return bullet;
    }
}


const posNeg = () => Math.random() < 0.5 ? -1 : 1;
const randomVelocity = () => Math.random() * posNeg() / 2;
const randomColor = () => {
    let keys = Object.keys(palette);
    return keys[Math.floor(Math.random() * keys.length)];
}
const distance = (p, q) => { 
    var dx   = p.x - q.x;         
    var dy   = p.y - q.y;         
    var dist = Math.sqrt( dx*dx + dy*dy ); 
    return dist;
}