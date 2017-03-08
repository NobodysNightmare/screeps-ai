const spawnHelper = require("helper.spawning");
const healer = require("role.healer");
const hopper = require("role.hopper");

const drainHopperCount = 2;

module.exports = function(roomai) {
    var room = roomai.room;
    return {
        run: function() {
            this.drainRoom();
        },
        drainRoom: function() {
            if(!(Game.flags.spawnDrain && Game.flags.spawnDrain.pos.roomName == room.name)) {
                return;
            }
            
            if(!Game.flags.drain) return;
            if(!roomai.canSpawn()) return;
            
            let targetRoom = Game.flags.drain.pos.roomName;
            let healers = spawnHelper.globalCreepsWithRole(hopper.name);
            let hoppers = spawnHelper.globalCreepsWithRole(hopper.name, { filter: (c) => c.memory.room == targetRoom });
            
            for(let hopper of hoppers) {
                if(!_.any(healers, (c) => c.memory.target == hopper.id)) {
                    roomai.spawn(spawnHelper.bestAffordableParts(room, healer.configs({ minHeal: 5, maxHeal: 20, healRatio: 2 })), { role: healer.name, target: hopper.id, avoidHostileRooms: true });
                }
            }
            
            if(hoppers.length < drainHopperCount) {
                roomai.spawn(spawnHelper.bestAvailableParts(room, hopper.configs()), { role: hopper.name, room: targetRoom });
            }
        }
    }
};