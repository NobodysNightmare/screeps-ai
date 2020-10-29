const boosting = require("helper.boosting");
const logistic = require("helper.logistic");
const movement = require("helper.movement");

const NUKE_MARGIN = 1000000;

// returns a value between 0.95 and 1.05 to add some randomness
// to equivalent walls (different masons will choose different walls)
function jitter() {
    return 1 + (0.05 - Math.random() * 0.1);
}

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

        if(creep.memory.building && creep.store.energy == 0) {
            creep.memory.building = false;
            creep.memory.lastTarget = null;
        }
        if(!creep.memory.building && creep.store.energy == creep.store.getCapacity()) {
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
        for(let nuke of _.sortBy(nukes, (n) => n.timeToLand)) {
            let x = nuke.pos.x;
            let y = nuke.pos.y;
            let targets = _.filter(_.map(creep.room.lookForAtArea(LOOK_STRUCTURES, y - 2, x - 2, y + 2, x + 2, true), (r) => r.structure), (s) => s.structureType === STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL);
            targets = _.filter(targets, (r) => {
                let neededHits = _.sum(nukes, (n) => {
                    let range = r.pos.getRangeTo(n);
                    return range <= 2 ? (range === 0 ? 10000000 : 5000000) : 0;
                })

                return r.hits < Math.min(neededHits + NUKE_MARGIN, r.hitsMax);
            });

            targets = _.sortBy(targets, (r) => r.pos.getRangeTo(nuke));
            if(targets[0]) return targets[0];
        }

        let targets = _.filter(creep.room.ai().defense.borderStructures, (s) => s.hits < s.hitsMax);
        if(targets.length > 0) {
            return _.sortBy(targets, (t) => t.hits * jitter())[0];
        }

        return null;
    },
    repair: function(creep, target) {
        if(!target) return;
        let result = creep.repair(target);

        creep.memory.lastTarget = target.id;

        if(result == ERR_NOT_IN_RANGE) {
            creep.goTo(target, { range: 3 });
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
