var claimer = require("role.claimer");
var conqueror = require("role.conqueror");

var roles = {
    claimer: claimer,
    conqueror: conqueror
}

module.exports = {
    enqueue: function(spawn) {
        var target = Game.flags.Claim.pos;
        spawn.room.memory.claimTarget = this.serializePos(target);
        spawn.room.memory.claimQueue = [
            "claimer",
            "conqueror",
            "conqueror"
        ];
    },
    
    perform: function(spawn) {
        var nextRoleName = spawn.room.memory.claimQueue && spawn.room.memory.claimQueue[0];
        if(!nextRoleName) {
            return false;
        }
        
        var role = roles[nextRoleName];
        if(this.spawnRole(spawn, role)) {
            spawn.room.memory.claimQueue.shift();
            if(spawn.room.memory.claimQueue.length == 0) {
                spawn.room.memory.claimTarget = null;
            }
            return true;
        }
        
        return false;
    },
    spawnRole: function(spawn, role, target) {
        target = target || spawn.room.memory.claimTarget;
        var parts = _.find(role.partConfigs, function(config) {
            return _.sum(_.map(config, (part) => BODYPART_COST[part])) <= spawn.room.energyCapacityAvailable;
        });

        var result = spawn.createCreep(parts, undefined, { role: role.name, target: spawn.room.memory.claimTarget });
        if(_.isString(result)) {
            return result;
        }
        
        return false;
    },
    serializePos: function(target) {
        return { 
            x: target.x, 
            y: target.y, 
            roomName: target.roomName 
        };
    }
};