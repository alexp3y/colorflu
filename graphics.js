class Graphics {
    static renderGame(game) {
        Graphics.placeElement(game.ship);
        game.bursts.forEach(burst => {
            burst.bubbles.forEach(bubble => {
                Graphics.placeElement(bubble);
            });
        });
    }

    static addElement(element, type) {
        let div = $('<div>').addClass(type);
        div.attr('id', `${element.id}`);
        div.css('left', `${element.xPos}px`);
        div.css('top', `${element.yPos}px`);
        div.css('background-color', `#${element.color}`)  
        $('.container').append(div); 
    }
    
    static placeElement(screenElement) {
        let div = $(`#${screenElement.id}`);
        div.css('left', `${screenElement.xPos}px`);
        div.css('top', `${screenElement.yPos}px`);
    }
}