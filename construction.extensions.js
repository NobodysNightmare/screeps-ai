module.exports = {
    perform: function(room) {
        if(Game.time % 10 != 0) {
            return;
        }
        
        for(var spawn of room.find(FIND_MY_SPAWNS)) {
            var position = spawn.pos;
            for(var xOff = -2; xOff <= 2; xOff += 2) {
                for(var yOff = -2; yOff <= 2; yOff += 2) {
                    if(xOff != 0 || yOff != 0) {
                        var result = room.createConstructionSite(position.x + xOff,
                                                                 position.y + yOff,
                                                                 STRUCTURE_EXTENSION);
                        if(result == ERR_RCL_NOT_ENOUGH || result == ERR_FULL) {
                            return;
                        }
                    }
                }
            }
        }
    }
};