const engine = new Engine();

$('document').ready(function() {
    // register event listeners
    $(document).keydown(keydown);
    $(document).keyup(keyup);
    $(document).mousedown(mousedown);
    // start game and run engine
    engine.turnOn($(document).height(), $(document).width());
})

function keypress(event) {
    engine.handleKeypress(event);
}

function keydown(event) {
    engine.handleKeydown(event);
}

function keyup(event) {
    engine.handleKeyup(event);
}

function mousedown(event) {
    engine.handleMousedown(event);
}