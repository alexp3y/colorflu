// Radii
const SHIP_RADIUS = 25;
const ENEMY_RADIUS = 8;
const AMMO_RADIUS = 5;
const BULLET_RADIUS = 5;
const PLASMID_RADIUS = 2;
const ENEMY_BURST_MAX_RADIUS = $(window).height() * 2/5;
const ENEMY_BURST_MIN_RADIUS = ENEMY_BURST_MAX_RADIUS / 5;
const AMMO_BURST_MAX_RADIUS = $(window).height() * 1/8;
const AMMO_BURST_MIN_RADIUS = AMMO_BURST_MAX_RADIUS / 2;
const BUBBLES_PER_BURST = 65;
// Velocities
const SHIP_VELOCITY = 3;
const BULLET_VELOCITY = 6;
const BULLET_VELOCITY_DIAG = Math.sqrt(Math.pow(BULLET_VELOCITY, 2)/2);
const SCROLL_ADJUST_VELOCITY = 2;
const PHAGO_VELOCITY = .1;
const PHAGO_PENALTY = .8;
// Clock Delays
const SHIP_TRIGGER_DELAY = 3;
// Other stuff...
const GRADIENT_OFFSET = 100;
const INFECT_RADIUS_OFFSET = 5;
const INFECTION_LIMIT = 50;
const DESTROYED_SHIP_FRAGMENTS = 16;


class Game {
    constructor(height, width) {
        this.menu = new Menu(),
        this.board = new Board(height, width),
        this.ship = new Ship(width/2 - 2*SHIP_RADIUS - height/9, height/2 - SHIP_RADIUS),
        this.titleOn = true,
        this.paused = false,
        this.gameOver = false,
        this.level = 1,
        this.levelProgress = 0,
        this.loopCounter = 0;
        // add first enemy bursts
        this.board.addEnemyBurst(width * 5/6, height/6)
        this.board.addEnemyBurst(width * 5/6, height/2)
        this.board.addEnemyBurst(width * 5/6, height * 5/6)
        this.board.addEnemyBurst(width * 4/6, height * 1/3)
        this.board.addEnemyBurst(width * 4/6, height * 2/3)
        this.board.addEnemyBurst(width, height * 1/3)
        this.board.addEnemyBurst(width, height * 2/3)
        // add first ammo bursts
        this.board.addAmmoBurst(width * 1/6, height/2);
        this.board.addAmmoBurst(width * 1/6, height * 5/12);
        this.board.addAmmoBurst(width * 1/6, height * 7/12);
    }
    incrementLoopCounter() {
        this.loopCounter++;
    }
    isDelayReady(delay) {
        return this.loopCounter%delay == 0;
    }    
    updateGame() {
        this.incrementLoopCounter();
        if (!this.paused && !this.titleOn) {
            this.updateScrolling();
            this.updateShip();
            this.updateEnemyBursts();
            this.updateAmmoBursts();
            this.updateBullets();
            let scrollAdjust = this.moveGameElements();
            this.levelProgress += -(scrollAdjust);
        }
    }
    updateScrolling() {
        this.board.rightScrollActive = (this.ship.x+this.ship.r >= this.board.w/2 && this.ship.rightGasOn) 
            ? true : false;
        this.board.leftScrollActive = (this.levelProgress > 0 && this.ship.leftGasOn)
            ? true : false;
    }
    updateEnemyBursts() {
        this.board.enemyBursts.forEach((burst, i) => {
            burst.bubbles.forEach((enemy, j) => {                
                if (enemy.isCollidedWith(this.ship)) {  // enemy-ship collision
                    if (!enemy.isDestroyed() && !this.isGameOver()) {
                        this.ship.eatEnemy(this.board.enemyBursts[i].bubbles.splice(j,1)[0]);
                    }
                } else if (this.board.isBubbleOutOfBounds(enemy)) { // enemy boundary check
                    this.board.enemyBursts[i].bubbles.splice(j,1);
                } else {
                    this.board.bullets.forEach((bullet, k) => {  // enemy-bullet collisions
                        if (enemy.isCollidedWith(bullet) && !enemy.destroyed) {
                            this.board.enemyBursts[i].bubbles[j].destroy(bullet);
                            this.board.bullets[k].destroy();
                        }
                    });
                }
            });
            // burst-level actions
            if (burst.bubbles.length == 0) {
                this.board.enemyBursts.splice(i,1);
            } else if (burst.isGrowing()) {
                if (burst.isAtMaxRadius()) burst.reverseBurstDirection();
            } else {
                if (burst.isAtMinRadius()) burst.reverseBurstDirection();
            }
        });        
    }
    updateAmmoBursts() {
        this.board.ammoBursts.forEach((burst, i) => {
            burst.bubbles.forEach((ammo, j) => {
                if (ammo.isCollidedWith(this.ship)) { // ammo-ship collision
                    this.ship.pickupAmmo(this.board.ammoBursts[i].bubbles.splice(j,1)[0]);
                } else if (this.board.isBubbleOutOfBounds(ammo)) { // ammo boundary check
                    this.board.ammoBursts[i].bubbles.splice(j,1);
                }
            });
            // burst-level actions
            if (burst.bubbles.length == 0) {
                this.board.ammoBursts.splice(i,1);
            } else if (burst.isGrowing()) {
                if (burst.isAtMaxRadius()) burst.reverseBurstDirection();
            } else {
                if (burst.isAtMinRadius()) burst.reverseBurstDirection();
            }        
        });     
    }
    updateBullets() {
        this.board.bullets.forEach((bullet, i) => {
            if (this.board.isBubbleOutOfBounds(bullet)) this.board.bullets.splice(i,1);
            else if (bullet.isDestroyed()) this.board.bullets.splice(i, 1);
        });        
    }
    updateShip() {
        this.board.enforceShipBoundary(this.ship);
        this.ship.applyGas();
        this.ship.applyPhagoPenalty();
        if (this.board.leftScrollActive || this.board.rightScrollActive) {
            this.ship.xVel = 0;
        }
        // check if its time to end this rodeo
        if (this.isGameOver() || this.ship.phagocytosis.length + this.ship.infection.length >= INFECTION_LIMIT) {
            this.gameOver = true;
            this.ship.xVel = 0;
            this.ship.yVel = 0;
        }
        // always update the phago enemies
        this.ship.phagocytosis.forEach((e, i) => {
            if (radialDistance(this.ship, e) < this.ship.r - e.r) {
                this.ship.addInfection(this.ship.phagocytosis.splice(i, 1)[0]);
            } else {
                e.xVel = e.phagoXVel + this.ship.xVel;
                e.yVel = e.phagoYVel + this.ship.yVel;
            }
        });
        // when no more phago enemies, destroy the ship
        if (this.isGameOver() && !this.ship.isDestroyed() && this.ship.phagocytosis.length == 0) {
            this.ship.destroy();            
        }
        // spit hot fire like D-Y-L-A-N
        if (this.isDelayReady(SHIP_TRIGGER_DELAY) && this.ship.isShooting()) {
            let bullet = this.ship.shootBullet();
            if (bullet != null) this.board.bullets.push(bullet);
        }        
    }
    moveGameElements() {
        let scrollAdjust = this.determineScrollAdjust();
        // move enemy bursts
        this.board.enemyBursts.forEach(burst => {
            burst.x += scrollAdjust;
            burst.bubbles.forEach(enemy => enemy.move(scrollAdjust));
        });
        // move ammo bursts
        this.board.ammoBursts.forEach(burst => { 
            burst.x += scrollAdjust;
            burst.bubbles.forEach(ammo => ammo.move(scrollAdjust));
        });
        // move bullets
        this.board.bullets.forEach(bullet => bullet.move(scrollAdjust));
        // move ship
        if (this.ship.isDestroyed()) {
            this.moveDestroyedShip();
        } else {
            this.moveShip();
        }
        return scrollAdjust;
    }
    determineScrollAdjust() {
        let scrollAdjust = 0;
        if (!this.isGameOver()) {
            if (this.board.leftScrollActive) scrollAdjust += SCROLL_ADJUST_VELOCITY;
            else if (this.board.rightScrollActive) scrollAdjust -= SCROLL_ADJUST_VELOCITY;
            scrollAdjust *= this.ship.getPhagoPenaltyMultiplier();
        }
        return scrollAdjust;
    }
    moveShip() {
        this.ship.move(0);
        this.ship.phagocytosis.forEach(e => e.move(0));
        this.ship.infection.forEach(p => {
            p.xVel = p.plasmidXVel + this.ship.xVel;
            p.yVel = p.plasmidYVel + this.ship.yVel;
            // simulate movement to see if current trajectory is possible
            let pFuture = new MovableElement(p.x, p.y, p.r, p.xVel, p.yVel);
            pFuture.move(0);
            if (radialDistance(this.ship, pFuture) >= this.ship.r - (1.5 * PLASMID_RADIUS)) {
                p.xVel = this.ship.xVel;
                p.yVel = this.ship.yVel;
                p.plasmidXVel = randomVelocity();
                p.plasmidYVel = randomVelocity();
            }
            p.move(0);
        });
    }
    moveDestroyedShip() {
        this.ship.infection.forEach(p => {
            p.xVel = p.plasmidXVel;
            p.yVel = p.plasmidYVel;
            p.move(0);
        })
        this.ship.destroyedFragments.forEach(f => f.move(0));
    }
    moveInfectionBordered() {

    }
    moveInfectionNoBorder
    isGameOver() {
        return this.gameOver;
    }
}


class Menu {
    constructor() {
        this.startSignal = false,
        this.unpauseSignal = false,
        this.selected = "NEW_GAME";
    }
    moveSelectedDown() {
        switch (this.selected) {
            case "RESUME":
                this.selected = "NEW_GAME";
                break;
            case "NEW_GAME":
                this.selected = "CONTROLS";
                break;
            case "CONTROLS":
                this.selected = "SOUND";
                break;
            default:
                break;
        }
    }
    moveSelectedUp(paused) {
        switch (this.selected) {
            case "NEW_GAME":
                if (paused) {
                    this.selected = "RESUME";
                }
                break;
            case "CONTROLS":
                this.selected = "NEW_GAME";
                break;
            case "SOUND":
                this.selected = "CONTROLS";
                break;
            default:
                break;
        }
    }
    executeSelected() {
        switch (this.selected) {
            case "RESUME":
                this.unpauseSignal = true;
                break;
            case "NEW_GAME":
                this.startSignal = true;
                this.selected = "RESUME";
                break;
            case "CONTROLS":
                break;
            case "SOUND":
                break;
            default:
                break;
        }
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
        if (ship.x-ship.r <= 0) ship.leftGasOn = false;
        if (ship.x+ship.r >= this.w) ship.rightGasOn = false; 
        if (ship.y-ship.r <= 0) ship.upGasOn = false;
        if (ship.y+ship.r >= this.h) ship.downGasOn = false;
    }
    addAmmoBurst(x, y) {
        let ammoBurst = new Burst(x, y, AMMO_BURST_MIN_RADIUS, AMMO_BURST_MAX_RADIUS);
        for (let i=0; i<BUBBLES_PER_BURST; i++) {
            ammoBurst.bubbles.push(new Ammo(x, y));
        }
        this.ammoBursts.push(ammoBurst);
    }
    addEnemyBurst(x, y) {
        let enemyBurst = new Burst(x, y, ENEMY_BURST_MIN_RADIUS, ENEMY_BURST_MAX_RADIUS);
        for (let i=0; i<BUBBLES_PER_BURST; i++) {
            enemyBurst.bubbles.push(new Enemy(x, y));
        }
        this.enemyBursts.push(enemyBurst);
    }
}


class Burst {
    constructor(x, y, minRadius, maxRadius) {
        this.x = x,
        this.y = y,
        this.r = 0,
        this.growing = true,
        this.minRadius = minRadius,
        this.maxRadius = maxRadius,
        this.bubbles = []
    }
    isAtMaxRadius() {
        let furthestBubble = 0;
        for (let i=0; i<this.bubbles.length; i++) {
            if (!this.bubbles[i].isDestroyed()) {
                let bubbleDistance = radialDistance(this, this.bubbles[i]);
                if (bubbleDistance > furthestBubble) furthestBubble = bubbleDistance;
            }
        }
        return (furthestBubble > this.maxRadius) ? true : false;
    }
    isAtMinRadius() {
        let furthestBubble = 0;
        for (let i=0; i<this.bubbles.length; i++) {
            if (!this.bubbles[i].isDestroyed()) {
                let bubbleDistance = radialDistance(this, this.bubbles[i]);
                if (bubbleDistance > furthestBubble) furthestBubble = bubbleDistance;
            }
        }
        return (furthestBubble < this.minRadius) ? true : false;
    }
    isGrowing() {
        return this.growing;
    }
    reverseBurstDirection() {
        this.growing = (this.growing) ? false : true;
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
        this.color = color
        this.destroyed = false;
    }
    move(scrollAdjust) {
        this.x += this.xVel+scrollAdjust;
        this.y += this.yVel;
    }
    isCollidedWith(element) {
        return radialDistance(this, element) <= (this.r + element.r);
    }
    destroy() {
        this.destroyed = true;
    }
    isDestroyed() {
        return this.destroyed;
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
        this.phagoTheta = 0,
        this.xPhagoOffset = 0,
        this.yPhagoOffset = 0,
        this.phagoXVel = 0,
        this.phagoYVel = 0,
        this.plasmidXVel = 0,
        this.plasmidYVel = 0;
    }
    destroy(bullet) {
        super.destroy();
        this.color = bullet.color;
        this.xVel = 0;
        this.yVel = 0;        
    }
}


class Ship extends MovableElement {
    constructor(x, y) {
        super(x, y, SHIP_RADIUS, 0, 0, 'pink');
        this.upTriggerOn = false,
        this.downTriggerOn = false,
        this.leftTriggerOn = false,
        this.rightTriggerOn = false,
        this.upGasOn = false,
        this.downGasOn = false,
        this.leftGasOn = false,
        this.rightGasOn = false,
        this.destroyedFragments = [],
        this.infection = [],
        this.phagocytosis = [],
        this.ammo = {};
        // initialize ammo array using palette colors
        Object.keys(palette).forEach(color => this.ammo[color] = 0);
    }
    destroy() {
        this.destroyed = true;
        for (let i = 0; i < DESTROYED_SHIP_FRAGMENTS; i++) {
            this.destroyedFragments.push(new Bubble(this.x, this.y, this.r, this.color));
        }
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
    getPhagoPenaltyMultiplier() {
        return Math.pow(PHAGO_PENALTY, this.phagocytosis.length);
    }
    applyPhagoPenalty() {
        let phagoPenaltyMultiplier = this.getPhagoPenaltyMultiplier();
        this.xVel *= phagoPenaltyMultiplier;
        this.yVel *= phagoPenaltyMultiplier;
    }
    addInfection(enemy) {
        enemy.x = this.x + ((this.r - INFECT_RADIUS_OFFSET - PLASMID_RADIUS) * Math.cos(enemy.phagoTheta));
        enemy.y = this.y + ((this.r - INFECT_RADIUS_OFFSET - PLASMID_RADIUS) * Math.sin(enemy.phagoTheta));
        enemy.plasmidXVel = randomVelocity();
        enemy.plasmidYVel = randomVelocity();
        enemy.r = PLASMID_RADIUS;
        this.infection.push(enemy);
    }
    eatEnemy(enemy) {
        if (!enemy.isDestroyed()) {
            let distance = radialDistance(this, enemy);
            let xDelta = Math.abs(this.x - enemy.x);
            let yDelta = Math.abs(this.y - enemy.y);
            enemy.phagoTheta = Math.atan(yDelta / xDelta);
            enemy.phagoXVel = PHAGO_VELOCITY * Math.cos(enemy.phagoTheta);
            enemy.phagoYVel = PHAGO_VELOCITY * Math.sin(enemy.phagoTheta);
            if (enemy.x < this.x) {
                if (enemy.y < this.y) {
                    // Q2
                    enemy.phagoTheta = Math.PI + enemy.phagoTheta;
                } else {
                    // Q3
                    enemy.phagoTheta = Math.PI - enemy.phagoTheta;
                    enemy.phagoYVel *= -1;
                }
            } else {
                enemy.phagoXVel *= -1;
                if (enemy.y < this.y) {
                    // Q1
                    enemy.phagoTheta = 2*Math.PI - enemy.phagoTheta;
                } else {
                    // Q4
                    enemy.phagoYVel *= -1;
                }
            }
            this.phagocytosis.push(enemy);
        }
    }
    hasAmmo() {
        let hasAmmo = false;
        Object.values(this.ammo).forEach(a => {
            if (a > 0) hasAmmo = true;
        });
        return hasAmmo;
    }
    pickupAmmo(bubble) {
        this.ammo[bubble.color] += 2;
    }
    isShooting() {
        return ((this.leftTriggerOn && !this.rightTriggerOn) ||
                (this.rightTriggerOn && !this.leftTriggerOn) ||
                (this.upTriggerOn && !this.downTriggerOn) ||
                (this.downTriggerOn && !this.upTriggerOn)) ? true : false; 
    }
    selectHighestPowerAmmo() {
        if (!this.hasAmmo()) {
            return null;
        }
        let selected = 'red';
        Object.keys(this.ammo).forEach( a => {
            if (this.ammo[a] > 0 && palette[a].powerLvl > palette[selected].powerLvl) {
                selected = a;
            }            
        });
        return selected;
    }
    shootBullet() {
        if (this.hasAmmo()) {
            // select the highest power ammo color available
            let selected = this.selectHighestPowerAmmo();
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
}


const posNeg = () => Math.random() < 0.5 ? -1 : 1;
const randomVelocity = () => Math.random() * posNeg() / 2;
const randomColor = (n) => {
    let keys = Object.keys(palette);
    return (n || n == 0) ? keys[n] : keys[Math.floor(Math.random() * keys.length)];
}
const radialDistance = (p, q) => { 
    var dx   = p.x - q.x;         
    var dy   = p.y - q.y;         
    var dist = Math.sqrt( dx*dx + dy*dy ); 
    return dist;
}