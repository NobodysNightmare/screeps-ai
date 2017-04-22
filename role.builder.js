const logistic = require("helper.logistic");
const movement = require("helper.movement");

const fullHealthEquiv = 50000;
var emergencyHitPercent = 0.3;

module.exports = {
    name: "builder",
    configs: function(workParts) {
        var configs = [];
        for(let work = workParts; work >= 2; work -= 1) {
            let carry = Math.floor(work / 2);
            let move = work + carry;
            let config = Array(work).fill(WORK).concat(Array(carry).fill(CARRY)).concat(Array(move).fill(MOVE));
            if(config.length <= 50) configs.push(config);
        }

        // TODO: probably more handcrafted configs for low tiers?
        configs.push([WORK, WORK, CARRY, MOVE]); // spawn-only config

        return configs;
    },
    run: function(creep) {
        if(creep.memory.room && creep.room.name !== creep.memory.room) {
            movement.moveToRoom(creep, creep.memory.room);
            return;
        } else if(movement.isOnExit(creep)) {
            movement.leaveExit(creep);
        }
        
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
        let supplyNominal = creep.room.storage && creep.room.storage.store.energy >= 10000;
        var targets = creep.room.find(FIND_STRUCTURES, { filter: function(structure) {
            return structure.hits < structure.hitsMax &&
                    (supplyNominal || structure.hits < fullHealthEquiv) &&
                    (structure.structureType != STRUCTURE_ROAD || (structure.hits / structure.hitsMax <= 0.8)) &&
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
            creep.moveTo(target, { range: 3 });
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
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'builder');
