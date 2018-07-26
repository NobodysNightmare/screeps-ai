const parkStructures = [STRUCTURE_STORAGE, STRUCTURE_POWER_BANK, STRUCTURE_CONTAINER];

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
                let target = { pos: new RoomPosition(25, 25, creep.memory.target) };
                creep.goTo(target, { avoidHostiles: true, newPathing: true });
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
            creep.goTo(target, { ignoreRoads: true, avoidHostiles: true, newPathing: true });
        }
    },
    scoopRoom: function(creep) {
        if(_.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.returningHome = true;
            return;
        }

        let target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
        if(!target && (!creep.room.controller || (creep.room.controller && !creep.room.controller.my))) {
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (s) => parkStructures.includes(s.structureType) && _.sum(s.store) > 0 });
        }

        if(!target) {
            if(_.sum(creep.carry) > 0) {
                creep.memory.returningHome = true;
            } else {
                // park and wait
                target = creep.pos.findClosestByRange(FIND_STRUCTURES,
                    { filter: (s) => parkStructures.includes(s.structureType) });
                if(!target) target = { pos: creep.room.getPositionAt(25, 25) };
                creep.goTo(target, { range: 5, ignoreRoads: true, avoidHostiles: true, newPathing: true });
            }

            return;
        }

        let result = null;
        if(target.structureType) {
            result = creep.withdraw(target, _.last(Object.keys(target.store)));
        } else {
            result = creep.pickup(target);
        }

        if(result === ERR_NOT_IN_RANGE) {
            creep.goTo(target, { ignoreRoads: true, avoidHostiles: true, newPathing: true });
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'scooper');
