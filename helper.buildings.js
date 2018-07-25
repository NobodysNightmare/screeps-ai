module.exports = {
    available: function(room, structureType) {
        let buildable = 0;
        if(room.controller) {
            buildable = CONTROLLER_STRUCTURES[structureType][room.controller.level] || 0;
        } else {
            if(structureType === STRUCTURE_ROAD) buildable = 2500;
            else if(structureType === STRUCTURE_CONTAINER) buildable = 5;
        }

        let built = room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === structureType }).length;
        let wip = room.find(FIND_CONSTRUCTION_SITES, { filter: (cs) => cs.structureType === structureType }).length;

        return Math.max(0, buildable - (built + wip));
    },
    underConstruction: function(room, structureType) {
        return room.find(FIND_MY_CONSTRUCTION_SITES, { filter: (cs) => cs.structureType === structureType }).length;
    }
};
