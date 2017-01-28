var spawnHelper = require("helper.spawning");

var container = require("construction.containers");
var logistic = require('helper.logistic');
var miner = require("role.miner");

module.exports = function(roomai) {
    var room = roomai.room;
    var sources = room.find(FIND_SOURCES);
    return {
        run: function() {
            this.buildContainers();
            this.buildMiners();
        },
        buildContainers: function() {
            if(Game.time % 20 != 0) {
                return;
            }
            
            for(var source of sources) {
                container.buildNear(source);
            }
        },
        buildMiners: function() {
            if(!roomai.canSpawn()) {
                return;
            }
            
            var existingMiners = spawnHelper.creepsWithRole(room, miner.name);
            for(var source of sources) {
                if(!_.any(existingMiners, (m) => m.memory.target == source.id) &&
                    logistic.storeFor(source)) {
                        
                    // TODO: using best affordable to prevent "deadlocks" with
                    // supply carriers not getting further resources b.c. of missing miner
                    var parts = spawnHelper.bestAffordableParts(room, miner.energyConfigs);
                    var memory = {
                        role: miner.name,
                        target: source.id,
                        resource: RESOURCE_ENERGY
                    };
                    
                    roomai.spawn(parts, memory);
                }
            }
        
        }
    }
};