const ff = require("helper.friendFoeRecognition");
const movement = require("helper.movement");

module.exports = {
    name: "ranger",
    configs: function() {
        let configs = [];
        for(let strength = 25; strength >= 5; strength -= 1) {
            let config = Array(strength - 2).fill(RANGED_ATTACK).concat(Array(strength).fill(MOVE)).concat(Array(2).fill(HEAL));
            if(config.length <= 50) configs.push(config);
        }

        return configs;
    },
    run: function(creep) {
        creep.heal(creep);
        
        var flag = Game.flags[creep.memory.flag];
        if(creep.pos.roomName == flag.pos.roomName) {
            this.attackRoom(creep);
        } else {
            movement.moveToRoom(creep, flag.pos.roomName);
        }
    },
    attackRoom: function(creep) {
        let hostiles = ff.findHostiles(creep.room);
        
        hostiles = _.sortBy(_.sortBy(hostiles, (h) => h.pos.getRangeTo(creep)), (h) => _.some(h.body, (p) => p.type === ATTACK || p.type === RANGED_ATTACK) ? 0 : 1);
        let target = hostiles[0];
        
        if(target) {
            this.attack(creep, target);
        } else {
            let friends = creep.room.find(FIND_MY_CREEPS, { filter: (c) => c.hits < c.hitsMax });
            if(creep.hits === creep.hitsMax && friends.length > 0) {
                if(creep.heal(friends[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(friends[0], { maxRooms: 1 });
                }
            } else {
                creep.moveTo(Game.flags[creep.memory.flag], { maxRooms: 1 });
            }
        }
    },
    attack: function(creep, target) {
        let targetRange = creep.pos.getRangeTo(target);
        let closeHostiles = _.filter(ff.findHostiles(creep.room), (c) => c.pos.getRangeTo(creep) <= 3);
        let dangerousHostiles = _.filter(closeHostiles, (c) => c.pos.getRangeTo(creep) <= 2 && c.canAttack());
        if(targetRange <= 3) {
            creep.rangedAttack(target);
        } else {
            if(dangerousHostiles.length > 0 || closeHostiles.length > 0) {
                creep.rangedAttack(dangerousHostiles[0] || closeHostiles[0]);
            }
        }
        
        if(dangerousHostiles.length > 0) {
            creep.fleeFrom(dangerousHostiles, 3);
        } else {
            if((target.canAttack() && targetRange > 3) || targetRange > 2) {
                creep.moveTo(target, { maxRooms: 1 });
            }
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'ranger');
