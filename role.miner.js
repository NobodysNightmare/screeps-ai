var spawnHelper = require('helper.spawning');
var storeStructures = [
    STRUCTURE_CONTAINER, 
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_TERMINAL
];

module.exports = {
    name: "miner",
    partConfigs: [
        [WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE]
    ],
    shouldBuild: function(spawn) {
        var room = spawn.room
        return room.controller.level >= 6 &&
            spawnHelper.numberOfCreeps(room, this.name) == 0 &&
            room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_EXTRACTOR }).length > 0 &&
            room.find(FIND_MINERALS)[0].mineralAmount > 0;
    },
    chooseParts: function(room) {
        return spawnHelper.bestAvailableParts(room, this.partConfigs);
    },
    run: function(creep) {
        // spawning: initialize with target and resource
        var target = Game.getObjectById(creep.memory.target);
        var store = this.storeFor(target);
        var harvestResult = creep.harvest(target);
        if(harvestResult == OK) {
            if(creep.transfer(store, creep.memory.resource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(store);
            }
        } else if(harvestResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    },
    storeFor: function(target) {
        var structures = target.pos.findInRange(FIND_STRUCTURES, 2);
        return _.find(structures, (r) => storeStructures.includes(r.structureType));
    }
};