const engine = new Engine();

$('document').ready(function() {
    $(document).keypress(keypress);
    $(document).mousedown(mousedown);

    engine.run();
})

function keypress(event) {
    engine.handleKeypress(event);
}

function mousedown(event) {
    engine.handleMousedown(event);
}