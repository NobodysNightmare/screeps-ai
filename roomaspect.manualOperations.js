const spawnHelper = require("helper.spawning");
const attacker = require("role.attacker");
const healer = require("role.healer");
const hopper = require("role.hopper");
const claimer = require("role.claimer");
const conqueror = require("role.conqueror");

const drainHopperCount = 2;

module.exports = function(roomai) {
    var room = roomai.room;
    return {
        run: function() {
            this.drainRoom();
            this.attackRoom();
            this.claimRoom();
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
        },
        claimRoom: function() {
            if(!(Game.flags.spawnClaim && Game.flags.spawnClaim.pos.roomName == room.name)) {
                return;
            }
            
            if(!Game.flags.claim) return;
            if(!roomai.canSpawn()) return;
            
            let targetRoom = Game.flags.claim.room;
            if(targetRoom && targetRoom.find(FIND_MY_SPAWNS).length > 0) return;
            
            let claimers = spawnHelper.globalCreepsWithRole(claimer.name);
            let conquerors = spawnHelper.globalCreepsWithRole(conqueror.name);
            let needClaimer = claimers.length == 0 && !(targetRoom && targetRoom.controller.my);
            
            if(needClaimer) {
                roomai.spawn(claimer.parts, { role: claimer.name });
            }
            
            if(conquerors.length < 2) {
                roomai.spawn(spawnHelper.bestAvailableParts(room, conqueror.configs()), { role: conqueror.name });
            }
        }
    }
};