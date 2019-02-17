function Graphics() {
    this.renderGame = function(game) {
        game.bursts.forEach(b => this.redrawBurst(b));
    },
    this.drawBurst = function(burst) {
        burst.bubbles.forEach(bubble => {
            let div = $('<div>').addClass('bubble');
            div.attr('id', `${burst.id}-${bubble.id}`);
            div.css('left', `${bubble.xPos}px`);
            div.css('top', `${bubble.yPos}px`);
            div.css('background-color', `#${Math.floor(Math.random()*16777215).toString(16)}`)  
            $('.container').append(div); 
        })
    },
    this.redrawBurst = function redrawBurst(burst) {
        burst.bubbles.forEach(bubble => {
            let div = $(`#${burst.id}-${bubble.id}`);
            div.css('left', `${bubble.xPos}px`);
            div.css('top', `${bubble.yPos}px`);
        });
    }
}