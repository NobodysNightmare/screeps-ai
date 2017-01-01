module.exports = {
    name: "upgrader",
    partConfigs: [
        [WORK, WORK, WORK, WORK, CARRY, WORK, MOVE, CARRY, MOVE, CARRY, MOVE],
        [WORK, CARRY, WORK, MOVE, CARRY, MOVE, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE]
    ],
    shouldBuild: function(spawn) {
        return spawn.room.find(FIND_MY_CREEPS, { filter: (creep) => creep.memory.role == this.name }).length < 4;
    },
    run: function(creep) {
        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
        }

        if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else {
            var source = creep.room.controller.pos.findClosestByRange(FIND_SOURCES);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    }
};