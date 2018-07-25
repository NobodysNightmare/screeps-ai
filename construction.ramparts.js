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
        if(!room.ai().intervals.buildComplexStructure.isActive()) {
            return;
        }

        for(let structure of room.find(FIND_STRUCTURES, { filter: (s) => protectedStructures.includes(s.structureType) })) {
            room.createConstructionSite(structure.pos, STRUCTURE_RAMPART);
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'ramparts');
