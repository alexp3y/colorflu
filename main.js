const engine = new Engine();

$('document').ready(function() {
    engine.turnOn();
    
    $(document).keypress(function(event){
        if (event.which == '32') {
            event.preventDefault();
            if (engine.running)  engine.pause();
            else engine.turnOn();
        }
    })

    $(document).mousedown(function(event){
        let newBurst = engine.game.addBurst(event.pageX, event.pageY);
        engine.graphics.drawBurst(newBurst);
    })
})
