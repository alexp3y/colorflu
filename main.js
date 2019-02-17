const engine = new Engine();

$('document').ready(function() {
    engine.run();
    
    $(document).keypress(function(event){
        if (event.which == '32') {
            event.preventDefault();
            if (engine.running)  engine.pause();
            else engine.run();
        }
    })

    $(document).mousedown(function(event){
        if (engine.running) {
            let newBurst = engine.game.addBurst(event.pageX, event.pageY);
            engine.graphics.drawBurst(newBurst);
        }
    })
})
