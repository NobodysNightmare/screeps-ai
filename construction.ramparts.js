var protectedStructures = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_TOWER,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_LAB,
    STRUCTURE_TERMINAL,
    STRUCTURE_CONTAINER,
    STRUCTURE_NUKER,
    STRUCTURE_OBSERVER
];

module.exports = {
    perform: function(room) {
        if(Game.time % 100 != 0) {
            return;
        }
        
        if(!(room.controller && room.controller.my)) {
            return;
        }
        
        for(var store of room.find(FIND_STRUCTURES, { filter: (s) => protectedStructures.includes(s.structureType) })) {
            room.createConstructionSite(store.pos, STRUCTURE_RAMPART);
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'ramparts');