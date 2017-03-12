module.exports = {
    perform: function() {
        var flag = Game.flags.claim;
        if(!flag) return;
        
        var room = Game.rooms[flag.pos.roomName];
        if(!room) return;
        if(!room.controller.my) return;
        
        for(var structure of room.find(FIND_HOSTILE_STRUCTURES)) {
            structure.destroy();
        }
        
        room.createConstructionSite(flag.pos, STRUCTURE_SPAWN);
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'claimSpawn');