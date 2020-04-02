const boosting = require("helper.boosting");
const ff = require("helper.friendFoeRecognition");
const spawnHelper = require("helper.spawning");

module.exports = {
    name: "guard",
    configs: function() {
        let configs = [];
        // TODO: probably use 2:1 ATTACK MOVE ratio
        for(let parts = 25; parts >= 4; parts -= 1) {
            configs.push(spawnHelper.makeParts(parts, ATTACK, parts, MOVE));
        }

        return configs;
    },
    run: function(creep) {
        if(creep.room.ai().defense.defcon >= 3) {
            if(boosting.accept(creep, "XUH2O")) return;
        } else {
            // Avoid running back to booster after defcon increases
            boosting.decline(creep, "XUH2O");
        }

        let hostile = ff.findClosestHostileByRange(creep.pos);
        if(this.isOnRampart(creep)) {
            if(!hostile) return;
            if(creep.pos.isNearTo(hostile)) {
                creep.attack(hostile);
            } else {
                this.moveTo(creep, this.findClosestGate(creep, hostile));
            }
        } else {
            if(hostile) {
                this.moveTo(creep, this.findClosestGate(creep, hostile));
                if(creep.pos.isNearTo(hostile)) {
                    creep.attack(hostile);
                }
            } else {
                this.moveTo(creep, this.findClosestGate(creep, creep));
            }
        }
    },
    isOnRampart: function(creep) {
      return _.some(creep.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType === STRUCTURE_RAMPART);
    },
    findClosestGate: function(creep, target) {
        let gates = creep.room.ai().defense.gates;
        gates = _.filter(gates, function(g) {
                let gatedCreep = g.pos.lookFor(LOOK_CREEPS)[0];
                return !gatedCreep || gatedCreep === creep;
            });
        return _.sortBy(gates, (g) => g.pos.getRangeTo(target))[0];
    },
    moveTo: function(creep, target) {
        // TODO: figure out whether we can use newPathing
        return creep.goTo(target, { ignoreRoads: true, avoidHostiles: true, newPathing: false });
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'guard');
