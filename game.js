const posOrNeg = () => Math.random() < 0.5 ? -1 : 1;
const randomVel = () => Math.random() * posOrNeg() / 2;

function Game() {
    this.bursts = [],
    this.addBurst = function(xPos, yPos) {
        let burst = new Burst(this.bursts.length + 1, xPos, yPos, 50);
        this.bursts.push(burst);
        return burst;
    }
    this.update = function() {
        this.bursts.forEach(bubble => bubble.move());
    }
}

function Burst(id, xPos, yPos, bubbleCount) {
    this.id = id,
    this.xPos = xPos,
    this.yPos = yPos,
    this.bubbles = [],
    this.move = function() {
        this.bubbles.forEach(bubble => bubble.move());
    }
    for (i=0; i<bubbleCount; i++) {
        this.bubbles.push(
            new Bubble(this.bubbles.length, this.xPos, this.yPos, randomVel(), randomVel()));
    }
}

function Bubble(id, xPos, yPos, xVel, yVel) {
    this.id = id,
    this.xPos = xPos,
    this.yPos = yPos,
    this.xVel = xVel,
    this.yVel = yVel,
    this.move = function() {
        this.xPos += this.xVel;
        this.yPos += this.yVel;
    }
}

function Ship() {
    this.xPos = 300,
    this.yPos = 300
}