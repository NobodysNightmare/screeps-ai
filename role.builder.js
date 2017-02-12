var logistic = require("helper.logistic");

var fullHealthEquiv = 50000;
var emergencyHitPercent = 0.3;

module.exports = {
    name: "builder",
    partConfigs: [
        [WORK, MOVE, WORK, MOVE, WORK, MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
        [WORK, MOVE, WORK, MOVE, WORK, MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE],
        [WORK, MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE],
        [WORK, WORK, MOVE, CARRY, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE]
    ],
    run: function(creep) {
        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.memory.lastTarget = null;
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
        }

        if(creep.memory.building) {
            var target = this.chooseTarget(creep);
            this.constructOrRepair(creep, target);
        }
        else {
            this.harvestEnergy(creep);
        }
    },
    chooseTarget: function(creep) {
        var lastTarget = Game.getObjectById(creep.memory.lastTarget);
        if(lastTarget) {
            if(this.isConstructionSite(lastTarget) || (!this.isConstructionSite(lastTarget) && lastTarget.hits < lastTarget.hitsMax)) {
                return lastTarget;
            }
        }
        
        var target = this.findEmergencyRepairTarget(creep) ||
                     this.findNormalPriorityConstructionTarget(creep) ||
                     this.findLowPriorityConstructionTarget(creep) ||
                     this.findNormalRepairTarget(creep);
        
        return target;
    },
    findNormalPriorityConstructionTarget: function(creep) {
        return creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, { filter: (cs) => cs.structureType != STRUCTURE_ROAD && cs.structureType != STRUCTURE_RAMPART });
    },
    findLowPriorityConstructionTarget: function(creep) {
        return creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, { filter: (cs) => cs.structureType == STRUCTURE_ROAD || cs.structureType == STRUCTURE_RAMPART });
    },
    findNormalRepairTarget: function(creep) {
        var targets = creep.room.find(FIND_STRUCTURES, { filter: function(structure) {
            return structure.hits < structure.hitsMax && 
                    structure.hits < (fullHealthEquiv * 2) &&
                    structure.structureType != STRUCTURE_CONTROLLER;
        } });
        if(targets.length > 0) {
            return _.sortBy(targets, (t) => t.hits / _.min([t.hitsMax, fullHealthEquiv]))[0];
        }
        
        return null;
    },
    findEmergencyRepairTarget: function(creep) {
        var that = this;
        var targets = creep.room.find(FIND_STRUCTURES, { filter: function(structure) {
            return structure.hits < that.emergencyHitpoints(structure) &&
                    structure.hits / structure.hitsMax < emergencyHitPercent && 
                    structure.hits < (fullHealthEquiv * 2) &&
                    structure.structureType != STRUCTURE_CONTROLLER;
        } });
        if(targets.length > 0) {
            var targetsByDistance = _.sortBy(targets, (t) => creep.pos.getRangeTo(t)); 
            return _.sortBy(targetsByDistance, (t) => t.hits)[0];
        }
        
        return null;
    },
    emergencyHitpoints: function(structure) {
        if(structure.structureType == STRUCTURE_CONTAINER) {
            return 10000;
        } else {
            return 1500;
        }
    },
    constructOrRepair: function(creep, target) {
        if(!target) return;
        var result;
        
        if(this.isConstructionSite(target)) {
            result = creep.build(target);
        } else {
            result = creep.repair(target);
        }
        
        if(result == OK) {
            // lock onto target as soon as actual work is happening
            creep.memory.lastTarget = target.id;
        } else if(result == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    },
    isConstructionSite: function(target) {
        return !target.hits;
    },
    harvestEnergy: function(creep) {
        var source = creep.pos.findClosestByRange(FIND_SOURCES);
        let result = logistic.obtainEnergy(creep, source, true);
        if(result == logistic.obtainResults.withdrawn) {
            creep.memory.building = true;
        }
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