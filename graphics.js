class Graphics {
    static renderGame(game) {
        Graphics.updateElement(game.ship);
        game.bursts.forEach(burst => {
            burst.bubbles.forEach(bubble => {
                Graphics.updateElement(bubble);
            });
        });
        Graphics.updateScore(game.score);
    }

    static togglePause(color) {
        $('.pause').css('color', `#${color}`);
        $('.pause').toggle();
    }

    static updateScore(score) {
        $('.scoreboard').html(score);
    }

    static addElement(element, type) {
        let div = $('<div>').addClass(type);
        div.attr('id', `${element.id}`);
        div.css('left', `${element.xPos}px`);
        div.css('top', `${element.yPos}px`);
        div.css('background-color', `#${element.color}`)  
        $('.container').append(div); 
    }
    
    static updateElement(element) {
        let div = $(`#${element.id}`);
        div.css('left', `${element.xPos}px`);
        div.css('top', `${element.yPos}px`);
        div.css('background-color', `#${element.color}`)  
    }
    
    static updateScoreboard(scoreboard) {
        let div = $(`#${scoreboard.id}`);
        div.html(scoreboard.score);
    }
    
    static removeElement(element) {
        $(`#${element.id}`).remove();
    } 
}