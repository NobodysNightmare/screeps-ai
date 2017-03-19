const movement = require("helper.movement");

const parkStructures = [STRUCTURE_STORAGE, STRUCTURE_POWER_BANK];

module.exports = {
    name: "scooper",
    configs:  function(capacity) {
        var configs = [];
        for(var carries = Math.ceil(capacity / 50); carries >= 2; carries -= 1) {
            let config = Array(carries).fill(CARRY).concat(Array(carries).fill(MOVE));
            if(config.length <= 50) configs.push(config);
        }

        return configs;
    },
    run: function(creep) {
        if(creep.memory.returningHome) {
            this.returnHome(creep);
        } else {
            if(creep.room.name !== creep.memory.target) {
                movement.moveToRoom(creep, creep.memory.target);
            } else {
                this.scoopRoom(creep);
            }
        }
    },
    returnHome: function(creep) {
        let home = Game.rooms[creep.memory.home];
        let target = home && home.storage;
        if(!target) return;
        if(creep.pos.isNearTo(target)) {
            let resource = _.findKey(creep.carry, (amount) => amount > 0);
            if(resource) {
                creep.transfer(target, resource);
            } else {
                creep.memory.returningHome = false;
            }
        } else {
            creep.moveTo(target);
        }
    },
    scoopRoom: function(creep) {
        if(_.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.returningHome = true;
            return;
        }

        let target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
        if(!target && creep.room.controller && !creep.room.controller.my) {
            target = creep.room.storage;
        }

        if(!target) {
            if(_.sum(creep.carry) > 0) {
                creep.memory.returningHome = true;
            } else {
                // park and wait
                target = creep.pos.findClosestByRange(FIND_STRUCTURES,
                    { filter: (s) => parkStructures.includes(s.structureType) });
                if(!target) target = creep.room.getPositionAt(25, 25);
                creep.moveTo(target, { range: 5 });
            }

            return;
        }

        if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'scooper');
