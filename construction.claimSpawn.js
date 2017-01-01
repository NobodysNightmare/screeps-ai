module.exports = {
    perform: function() {
        var flag = Game.flags.Claim;
        if(!flag) return;
        
        var room = Game.rooms[flag.pos.roomName];
        if(!room) return;
        if(!room.controller.my) return;
        
        room.createConstructionSite(flag.pos, STRUCTURE_SPAWN);
        flag.remove();
    }
};