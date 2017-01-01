var claimer = require("role.claimer");
var conqueror = require("role.conqueror");

var roles = {
    claimer: claimer,
    conqueror: conqueror
}

module.exports = {
    enqueue: function(spawn) {
        var target = Game.flags.Claim.pos;
        spawn.room.memory.claimTarget = { 
            x: target.x, 
            y: target.y, 
            roomName: target.roomName 
        };
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
        var parts = _.find(role.partConfigs, function(config) {
            return _.sum(_.map(config, (part) => BODYPART_COST[part])) <= spawn.room.energyCapacityAvailable;
        });

        var result = spawn.createCreep(parts, undefined, { role: role.name, target: spawn.room.memory.claimTarget });
        if(result == OK) {
            spawn.room.memory.claimQueue.shift();
            return true;
        }
        
        return false;
    }
};