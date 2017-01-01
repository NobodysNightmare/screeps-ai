module.exports = {
    name: "harvester",
    partConfigs: [
        [WORK, CARRY, WORK, MOVE, CARRY, MOVE, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE]
    ],
    shouldBuild: function(spawn) {
        return spawn.room.find(FIND_MY_CREEPS, { filter: (creep) => creep.memory.role == this.name }).length < 2;
    },
    run: function(creep) {
        if(creep.memory.delivering && creep.carry.energy == 0) {
            creep.memory.delivering = false;
        }
        if(!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
            creep.memory.delivering = true;
        }
        
        if(creep.memory.delivering) {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy < structure.energyCapacity;
                    }
            });
            
            if(!target) {
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_TOWER &&
                            structure.energy < structure.energyCapacity;
                    }
                });
            }
            
            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else if(creep.carry.energy < creep.carryCapacity) {
                creep.memory.delivering = false;
            }
        } else {
            var source = creep.pos.findClosestByRange(FIND_SOURCES);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    }
};