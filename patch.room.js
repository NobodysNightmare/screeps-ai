const RoomAI = require('roomai.base');

Room.prototype.ai = function() {
    if(this._ai === undefined) {
        if(this.controller && this.controller.my) {
            this._ai = new RoomAI(this);
        } else {
            this._ai = null;
        }
    }
    
    return this._ai;
}