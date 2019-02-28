// Radii
const SHIP_RADIUS = 35;
const ENEMY_RADIUS = 8;
const AMMO_RADIUS = 5;
const BULLET_RADIUS = 2;
const ENEMY_BURST_MAX_RADIUS = 100;
const AMMO_BURST_MAX_RADIUS = 100;
const BUBBLES_PER_BURST = 50;

// Velocities
const SHIP_VELOCITY = 3;
const BULLET_VELOCITY = 6;
const BULLET_VELOCITY_DIAG = Math.sqrt(Math.pow(BULLET_VELOCITY, 2)/2);
const SCROLL_ADJUST_VELOCITY = 2;

const GRADIENT_OFFSET = 100;

// Clock Delays
const SHIP_TRIGGER_DELAY = 3;
const SCROLL_DELAY = 6;


class Game {
    constructor(height, width) {
        this.board = new Board(height, width);
        this.ship = new Ship(width/3, height/2 ),
        this.paused = false,
        this.level = 1,
        this.levelProgress = 0,
        this.loopCounter = 0;
        // add first enemy bursts
        this.board.addEnemyBurst(width * 5/6, height/6)
        this.board.addEnemyBurst(width * 5/6, height/2)
        this.board.addEnemyBurst(width * 5/6, height * 5/6)
    }
    updateGame() {
        this.incrementLoopCounter();
        if (!this.paused) {
            // scrolling
            this.updateScrolling();
            // update board elements
            this.updateEnemyBursts();
            this.updateAmmoBursts();
            this.updateBullets();
            this.updateShip();
            // move all elements
            this.moveGameElements();
        }
    }
    updateScrolling() {
        this.board.rightScrollActive = (this.ship.x+this.ship.r >= this.board.w/2 && this.ship.rightGasOn) 
            ? true : false;
        this.board.leftScrollActive = (this.levelProgress > 0 && this.ship.leftGasOn)
            ? true : false;

        if (this.isDelayReady(SCROLL_DELAY)) {
            if (this.board.rightScrollActive) this.levelProgress++;
            else if (this.board.leftScrollActive) this.levelProgress--;
        }
    }
    updateEnemyBursts() {
        this.board.enemyBursts.forEach((burst, i) => {
            burst.bubbles.forEach((enemy, j) => {
                if (enemy.isCollidedWith(this.ship)) { // check ship colission
                    // ship die...
                    // this.board.enemyBursts[i].bubbles.splice(j,1);
                } else if (this.board.isBubbleOutOfBounds(enemy)) { // boundary check
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
    }
    updateAmmoBursts() {
        this.board.ammoBursts.forEach((burst, i) => {
            burst.bubbles.forEach((ammo, j) => {
                if (ammo.isCollidedWith(this.ship)) {
                    this.ship.pickupAmmo(this.board.ammoBursts[i].bubbles.splice(j,1)[0]);
                } else if (this.board.isBubbleOutOfBounds(ammo)) {
                    this.board.ammoBursts[i].bubbles.splice(j,1);
                }
            });
            if (burst.bubbles.length == 0) this.board.ammoBursts.splice(i,1);
            else if (burst.isAtMaxRadius()) burst.reverseBurstDirection();
        });        
    }
    updateBullets() {
        this.board.bullets.forEach((bullet, i) => {
            if (this.board.isBubbleOutOfBounds(bullet)) this.board.bullets.splice(i,1);
        });        
    }
    updateShip() {
        this.ship.applyGas();
        if (this.board.leftScrollActive || this.board.rightScrollActive) this.ship.xVel = 0;
        this.board.enforceShipBoundary(this.ship);
        if (this.isDelayReady(SHIP_TRIGGER_DELAY) && this.ship.isShooting()) {
            this.board.bullets.push(this.ship.shootBullet());
        }        
    }
    incrementLoopCounter() {
        this.loopCounter++;
        // if (this.loopCounter > 12) this.loopCounter = 1;  // 12 lets us do delayed effects at modulo 2, 3, 4, 6, 12
    }
    isDelayReady(delay) {
        return this.loopCounter%delay == 0;
    }
    moveGameElements() {
        let scrollAdjust = 0;
        if (this.board.leftScrollActive) scrollAdjust += SCROLL_ADJUST_VELOCITY;
        else if (this.board.rightScrollActive) scrollAdjust -= SCROLL_ADJUST_VELOCITY;

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
        this.leftScrollActive = true,
        this.rightScrollActive = true;
    }
    isBubbleOutOfBounds(bubble) {
        return (bubble.x < -this.w / 2) || // left
            (bubble.x > this.w * 1.5) ||   // right
            (bubble.y < - this.h / 2) ||     // top
            (bubble.y > this.h * 1.5)     // bottom
            ? true : false;
    }
    enforceShipBoundary(ship) {
        if (ship.x-ship.r <= 0) ship.xVel = 0;
        if (ship.x+ship.r >= this.w) ship.xVel = 0; 
        if (ship.y-ship.r <= 0) ship.yVel = 0;
        if (ship.y+ship.r >= this.h) ship.yVel = 0;
    }
    addAmmoBurst(x, y) {
        let ammoBurst = new Burst(x, y, 0, AMMO_BURST_MAX_RADIUS);
        for (let i=0; i<BUBBLES_PER_BURST; i++) {
            ammoBurst.bubbles.push(new Ammo(x, y));
        }
        this.ammoBursts.push(ammoBurst);
    }
    addEnemyBurst(x, y) {
        let enemyBurst = new Burst(x, y, 0, ENEMY_BURST_MAX_RADIUS);
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
    constructor(x, y, minRadius, maxRadius) {
        this.x = x,
        this.y = y,
        this.r = 0,
        this.minRadius = minRadius,
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
        // select the highest power ammo color available
        let selected = 'red';
        Object.keys(this.ammo).forEach(a => { 
            if (this.ammo[a] > 0 && palette[a].powerLvl > palette[selected].powerLvl) {
                selected = a;
            }
        });
        let bullet = new Bullet(this.x, this.y, BULLET_RADIUS, selected);
        this.ammo[selected]--;

        let xBoost = 0, 
            yBoost = 0;
        if (this.upTriggerOn)  {
            yBoost -= BULLET_VELOCITY;
        }
        if (this.downTriggerOn) {
            yBoost += BULLET_VELOCITY;
        }
        if (this.leftTriggerOn) {
            xBoost -= BULLET_VELOCITY;
        }
        if (this.rightTriggerOn) {
            xBoost += BULLET_VELOCITY;
        }
        if ((yBoost != 0) && (xBoost !=0)) {
            yBoost = (yBoost < 0) ? -BULLET_VELOCITY_DIAG : BULLET_VELOCITY_DIAG;
            xBoost = (xBoost < 0) ? -BULLET_VELOCITY_DIAG : BULLET_VELOCITY_DIAG;
        } 
        bullet.xVel += xBoost;
        bullet.yVel += yBoost;
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