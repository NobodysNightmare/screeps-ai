const spawnHelper = require("helper.spawning");
const attacker = require("role.attacker");
const healer = require("role.healer");
const hopper = require("role.hopper");

const drainHopperCount = 2;

module.exports = function(roomai) {
    var room = roomai.room;
    return {
        run: function() {
            this.drainRoom();
            this.attackRoom();
        },
        drainRoom: function() {
            if(!(Game.flags.spawnDrain && Game.flags.spawnDrain.pos.roomName == room.name)) {
                return;
            }
            
            if(!Game.flags.drain) return;
            if(!roomai.canSpawn()) return;
            
            let targetRoom = Game.flags.drain.pos.roomName;
            let healers = spawnHelper.globalCreepsWithRole(healer.name);
            let hoppers = spawnHelper.globalCreepsWithRole(hopper.name, { filter: (c) => c.memory.room == targetRoom });
            
            for(let hopperCreep of hoppers) {
                if(!_.any(healers, (c) => c.memory.target == hopperCreep.name)) {
                    let healerParts;
                    if(hopperCreep.spawning) {
                        healerParts = spawnHelper.bestAvailableParts(room, healer.configs({ minHeal: 5, maxHeal: 20, healRatio: 1 }));
                    } else {
                        healerParts = spawnHelper.bestAffordableParts(room, healer.configs({ minHeal: 5, maxHeal: 20, healRatio: 1 }));
                    }
                    roomai.spawn(healerParts, { role: healer.name, target: hopperCreep.name, avoidHostileRooms: true });
                }
            }
            
            if(hoppers.length < Game.flags.spawnDrain.color) {
                roomai.spawn(spawnHelper.bestAvailableParts(room, hopper.configs()), { role: hopper.name, room: targetRoom });
            }
        },
        attackRoom: function() {
            if(!(Game.flags.spawnAttack && Game.flags.spawnAttack.pos.roomName == room.name)) {
                return;
            }
            
            if(!Game.flags.attack) return;
            if(!roomai.canSpawn()) return;
            
            let targetRoom = Game.flags.attack.pos.roomName;
            let attackers = spawnHelper.globalCreepsWithRole(attacker.name, { filter: (c) => c.memory.flag == "attack" });
            
            if(attackers.length < Game.flags.spawnAttack.color) {
                roomai.spawn(spawnHelper.bestAvailableParts(room, attacker.meleeConfigs()), { role: attacker.name, flag: "attack" });
            }
        }
    }
};