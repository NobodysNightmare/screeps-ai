const movement = require("helper.movement");

module.exports = {
    name: "defender",
    meeleeConfigs: [
        [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE],
        [ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE]
    ],
    run: function(creep) {
        var room = Game.rooms[creep.memory.room];
        if(!room) {
            movement.moveToRoom(creep, creep.memory.room);
            return;
        }
        
        var target = Game.getObjectById(room.memory.primaryHostile);
        if(target) {
            this.attack(creep, target);
        } else {
            this.recycle(creep);
        }
    },
    attack: function(creep, target) {
        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    },
    recycle: function(creep) {
        var spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
        if(!spawn) {
            movement.moveToRoom(creep, creep.memory.originRoom);
            return;
        }
        
        if(creep.pos.isNearTo(spawn)) {
            spawn.recycleCreep(creep);
        } else {
            creep.moveTo(spawn);
        }
    }
};