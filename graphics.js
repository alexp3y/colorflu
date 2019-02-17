class Graphics {
    
    renderGame(game) {
        game.bursts.forEach(b => this.redrawBurst(b));
    }

    drawShip(ship) {
        let div = $('<div>').addClass('ship');
        div.attr('id', `${ship.id}-${ship.id}`);
        div.css('left', `${ship.xPos}px`);
        div.css('top', `${ship.yPos}px`);
        $('.container').append(div); 
    }

    drawBurst(burst) {
        burst.bubbles.forEach(bubble => {
            let div = $('<div>').addClass('bubble');
            div.attr('id', `${burst.id}-${bubble.id}`);
            div.css('left', `${bubble.xPos}px`);
            div.css('top', `${bubble.yPos}px`);
            div.css('background-color', `#${Math.floor(Math.random()*16777215).toString(16)}`)  
            $('.container').append(div); 
        })
    }
    
    redrawBurst(burst) {
        burst.bubbles.forEach(bubble => {
            let div = $(`#${burst.id}-${bubble.id}`);
            div.css('left', `${bubble.xPos}px`);
            div.css('top', `${bubble.yPos}px`);
        });
    }
}