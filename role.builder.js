const logistic = require("helper.logistic");
const movement = require("helper.movement");

const fullHealthEquiv = 50000;
const emergencyHitPercent = 0.3;

const highPriorityStructures = [STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TOWER];

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

        if(creep.memory.building && creep.store.energy == 0) {
            creep.memory.building = false;
            creep.memory.lastTarget = null;
        }
        if(!creep.memory.building && creep.store.energy == creep.store.getCapacity()) {
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
        let lastTarget = Game.getObjectById(creep.memory.lastTarget);
        if(lastTarget) {
            if(this.isConstructionSite(lastTarget) || (!this.isConstructionSite(lastTarget) && lastTarget.hits < lastTarget.hitsMax)) {
                return lastTarget;
            }
        }

        let constructions = _.sortBy(creep.room.find(FIND_MY_CONSTRUCTION_SITES), (cs) => cs.pos.getRangeTo(creep.pos));
        let target = this.findEmergencyRepairTarget(creep) ||
                     this.findHighPriorityConstructionTarget(creep, constructions) ||
                     this.findNormalPriorityConstructionTarget(creep, constructions) ||
                     this.findLowPriorityConstructionTarget(creep, constructions) ||
                     this.findNormalRepairTarget(creep);

        return target;
    },
    findHighPriorityConstructionTarget: function(creep, constructions) {
        return _.find(constructions, (cs) => highPriorityStructures.includes(cs.structureType));
    },
    findNormalPriorityConstructionTarget: function(creep, constructions) {
        let terrain = creep.room.getTerrain();
        return _.find(constructions, (cs) => (cs.structureType !== STRUCTURE_ROAD || terrain.get(cs.pos.x, cs.pos.y) === TERRAIN_MASK_SWAMP) && cs.structureType != STRUCTURE_RAMPART);
    },
    findLowPriorityConstructionTarget: function(creep, constructions) {
        return _.find(constructions, (cs) => cs.structureType == STRUCTURE_ROAD || cs.structureType == STRUCTURE_RAMPART);
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
        if(!target) {
            creep.memory.stopped = true;
            return;
        }
        var result;

        if(this.isConstructionSite(target)) {
            result = creep.build(target);
        } else {
            result = creep.repair(target);
        }

        if(result == OK) {
            // lock onto target as soon as actual work is happening
            creep.memory.lastTarget = target.id;
            creep.memory.stopped = true;
        } else if(result == ERR_NOT_IN_RANGE) {
            creep.goTo(target, { range: 3 });
            creep.memory.stopped = false;
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
