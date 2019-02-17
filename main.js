const game = new Game();

$('document').ready(function() {
    game.startGame();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
    game.addBubble();
})

const posNeg = () => Math.random() < 0.5 ? -1 : 1;

function updateGame() {
    game.bubbles.forEach(bubble => {
        bubble.move();
        redrawBubble(bubble);
    })
}

function createRandomBubble(id) {
    let xVel = Math.random() * posNeg();
    let yVel = Math.random() * posNeg();
    return new Bubble(id, 250, 250, xVel, yVel);
}

function drawBubble(bubble) {
    let div = $('<div>').addClass('bubble');
    div.attr('id', `bubble-${bubble.id}`);
    div.css('left', `${bubble.xPos}px`);
    div.css('top', `${bubble.yPos}px`);
    div.css('background-color', `#${Math.floor(Math.random()*16777215).toString(16)}`)  
    $('.container').append(div); 
}

function redrawBubble(bubble) {
    let div = $(`#bubble-${bubble.id}`);
    div.css('left', `${bubble.xPos}px`);
    div.css('top', `${bubble.yPos}px`);
}

function Game() {
    this.bubbles = [],
    this.gameLoopId = 0,
    this.addBubble = function() {
        let newBubble = createRandomBubble(this.bubbles.length++);
        drawBubble(newBubble);
        this.bubbles.push(newBubble);
    }
    this.startGame = function() {
        this.gameLoopId = setInterval(updateGame, 30);
    }
    this.stopGame = function() {
        clearInterval(this.gameLoopId);
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