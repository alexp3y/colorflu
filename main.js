const engine = new Engine();

$('document').ready(function() {
    $(document).keypress(engine.handleKeypress);
    $(document).mousedown(engine.handleMousedown);
    
    engine.run();
})
