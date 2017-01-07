module.exports = {
    perform: function(room) {
        if(Game.time % 10 != 0) {
            return;
        }
        
        for(var spawn of room.find(FIND_MY_SPAWNS)) {
            var position = spawn.pos;
            for(var distance = 2; distance <= 4; distance += 2) {
                for(var xOff = -distance; xOff <= distance; xOff += 2) {
                    for(var yOff = -distance; yOff <= distance; yOff += 2) {
                        if(Math.abs(xOff) == distance || Math.abs(yOff) == distance) {
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
    }
};