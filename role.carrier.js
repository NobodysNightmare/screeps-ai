module.exports = {
    name: "carrier",
    partConfigs: [
        [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE],
        [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE],
        [CARRY, CARRY, MOVE]
    ],
    shouldBuild: function(spawn) {
        // TODO: determine when to spawn it (and configure it correctly upon spawning)
        return false;
    },
    run: function(creep) {
        if(creep.memory.delivering && creep.carry.energy == 0) {
            creep.memory.delivering = false;
        }
        if(!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
            creep.memory.delivering = true;
        }

        if(creep.memory.delivering) {
            var target = this.containerFor(this.destination(creep));
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
        else {
            // TODO: also collect raw resources lying around the source
            var target = this.containerFor(this.source(creep));
            if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    },
    source: function(creep) {
      return Game.getObjectById(creep.memory.source);
    },
    destination: function(creep) {
      return Game.getObjectById(creep.memory.destination);
    },
    containerFor: function(target) {
        var structures = target.pos.findInRange(FIND_STRUCTURES, 2);
        return _.find(structures, (r) => r.structureType == STRUCTURE_CONTAINER);
    }
};