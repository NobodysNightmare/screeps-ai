var spawnHelper = require('helper.spawning');
var fullHealthEquiv = 50000;

module.exports = {
    name: "builder",
    partConfigs: [
        [WORK, MOVE, WORK, MOVE, WORK, MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE],
        [WORK, MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE]
    ],
    shouldBuild: function(spawn) {
        return spawnHelper.numberOfCreeps(spawn.room, this.name) < 2;
    },
    chooseParts: function(room) {
        return spawnHelper.bestAvailableParts(room, this.partConfigs);
    },
    run: function(creep) {
        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.memory.lastTarget = null;
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
        }

        if(creep.memory.building) {
            if(!this.constructStructures(creep)) {
                this.repairStructures(creep);
            }
        }
        else {
            this.harvestEnergy(creep);
        }
    },
    constructStructures: function(creep) {
        var target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if(target) {
            if(creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
        return target;
    },
    repairStructures: function(creep) {
        var lastTarget = Game.getObjectById(creep.memory.lastTarget)
        if(lastTarget && lastTarget.hits < lastTarget.hitsMax) {
            this.moveAndRepair(creep, lastTarget);
            return true;
        }
        
        var targets = creep.room.find(FIND_STRUCTURES, { filter: function(structure) {
            return structure.hits < structure.hitsMax && 
                    structure.hits < (fullHealthEquiv * 2) &&
                    structure.structureType != STRUCTURE_CONTROLLER;
        } });
        if(targets.length > 0) {
            var target = _.sortBy(targets, (t) => t.hits / _.min([t.hitsMax, fullHealthEquiv]))[0];
            this.moveAndRepair(creep, target);
            return true;
        }
        
        return false;
    },
    harvestEnergy: function(creep) {
        var source = creep.pos.findClosestByRange(FIND_SOURCES);
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
        
        return source;
    },
    moveAndRepair: function(creep, target) {
        var result = creep.repair(target);
        if(result == OK) {
            creep.memory.lastTarget = target.id;
        } else if(result == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
};