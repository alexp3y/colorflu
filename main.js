const engine = new Engine();

$('document').ready(function() {
    $(document).keypress(keypress);
    $(document).keydown(keydown);
    $(document).keyup(keyup);
    $(document).mousedown(mousedown);
    // start game and run engine
    engine.newGame($(document).width(), $(document).height())
    engine.run();
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