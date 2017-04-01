var logistic = require("helper.logistic");

module.exports = {
    name: "mason",
    configs: function(workParts) {
        var configs = [];
        for(let work = workParts; work >= 2; work -= 1) {
            let carry = Math.floor(work / 2);
            let move = work + carry;
            let config = Array(work).fill(WORK).concat(Array(carry).fill(CARRY)).concat(Array(move).fill(MOVE));
            if(config.length <= 50) configs.push(config);
        }

        return configs;
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
            var target = this.chooseTarget(creep);
            this.repair(creep, target);
        }
        else {
            this.harvestEnergy(creep);
        }
    },
    chooseTarget: function(creep) {
        var lastTarget = Game.getObjectById(creep.memory.lastTarget);
        if(lastTarget) {
            if(lastTarget.hits < lastTarget.hitsMax) {
                return lastTarget;
            }
        }

        var targets = creep.room.find(FIND_STRUCTURES, { filter: function(structure) {
            let pos = structure.pos;
            return structure.hits < structure.hitsMax &&
                    (structure.structureType == STRUCTURE_RAMPART || structure.structureType == STRUCTURE_WALL) &&
                    (pos.x <= creep.memory.x1 || pos.x >= creep.memory.x2 || pos.y <= creep.memory.y1 || pos.y <= creep.memory.y2);
        } });
        if(targets.length > 0) {
            return _.sortBy(targets, (t) => t.hits / t.hitsMax)[0];
        }

        return null;
    },
    repair: function(creep, target) {
        if(!target) return;
        let result = creep.repair(target);

        if(result == OK) {
            // lock onto target as soon as actual work is happening
            creep.memory.lastTarget = target.id;
        } else if(result == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { range: 3 });
        }
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
profiler.registerObject(module.exports, 'mason');
