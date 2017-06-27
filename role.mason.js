const boosting = require("helper.boosting");
const logistic = require("helper.logistic");
const movement = require("helper.movement");

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
        if(boosting.accept(creep, "XLH2O")) {
            return;
        }
        
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
        
        let nukes = creep.room.find(FIND_NUKES);
        for(let nuke of nukes) {
            let x = nuke.pos.x;
            let y = nuke.pos.y;
            let ramparts = _.filter(_.map(creep.room.lookForAtArea(LOOK_STRUCTURES, y - 2, x - 2, y + 2, x + 2, true), (r) => r.structure), (s) => s.structureType === STRUCTURE_RAMPART);
            ramparts = _.sortBy(_.filter(ramparts, (r) => (r.pos.x === x && r.pos.y === y && r.hits < 11000000) || r.hits < 6000000), (r) => r.pos.getRangeTo(nuke));
            if(ramparts[0]) return ramparts[0];
        }

        let walls = creep.room.memory.constructions && creep.room.memory.constructions.walls[0];
        if(!walls) {
            console.log("Perimeter for mason not defined in " + creep.room.name);
            return null;
        }
        var targets = creep.room.find(FIND_STRUCTURES, { filter: function(structure) {
            let pos = structure.pos;
            return structure.hits < structure.hitsMax &&
                    (structure.structureType == STRUCTURE_RAMPART || structure.structureType == STRUCTURE_WALL) &&
                    (pos.x <= walls.x1 || pos.x >= walls.x2 || pos.y <= walls.y1 || pos.y >= walls.y2);
        } });
        if(targets.length > 0) {
            return _.sortBy(targets, (t) => t.hits)[0];
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
