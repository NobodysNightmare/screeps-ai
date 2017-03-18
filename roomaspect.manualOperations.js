const spawnHelper = require("helper.spawning");
const attacker = require("role.attacker");
const healer = require("role.healer");
const hopper = require("role.hopper");
const claimer = require("role.claimer");
const conqueror = require("role.conqueror");
const miner = require("role.miner");

const drainHopperCount = 2;

module.exports = class ManualOperationsAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
    }

    run() {
        this.drainRoom();
        this.attackRoom();
        this.claimRoom();
    }

    drainRoom() {
        if(!(Game.flags.spawnDrain && Game.flags.spawnDrain.pos.roomName == this.room.name)) {
            return;
        }

        if(!Game.flags.drain) return;
        if(!this.roomai.canSpawn()) return;

        let targetRoom = Game.flags.drain.pos.roomName;
        let healers = spawnHelper.globalCreepsWithRole(healer.name);
        let hoppers = spawnHelper.globalCreepsWithRole(hopper.name, { filter: (c) => c.memory.room == targetRoom });

        for(let hopperCreep of hoppers) {
            if(!_.any(healers, (c) => c.memory.target == hopperCreep.name)) {
                let healerParts;
                if(hopperCreep.spawning) {
                    healerParts = spawnHelper.bestAvailableParts(this.room, healer.configs({ minHeal: 5, maxHeal: 20, healRatio: 1 }));
                } else {
                    healerParts = spawnHelper.bestAffordableParts(this.room, healer.configs({ minHeal: 5, maxHeal: 20, healRatio: 1 }));
                }
                this.roomai.spawn(healerParts, { role: healer.name, target: hopperCreep.name, avoidHostileRooms: true });
            }
        }

        if(hoppers.length < Game.flags.spawnDrain.color) {
            this.roomai.spawn(spawnHelper.bestAvailableParts(this.room, hopper.configs()), { role: hopper.name, room: targetRoom });
        }
    }

    attackRoom() {
        if(!(Game.flags.spawnAttack && Game.flags.spawnAttack.pos.roomName == this.room.name)) {
            return;
        }

        if(!Game.flags.attack) return;
        if(!this.roomai.canSpawn()) return;

        let targetRoom = Game.flags.attack.pos.roomName;
        let attackers = spawnHelper.globalCreepsWithRole(attacker.name, { filter: (c) => c.memory.flag == "attack" });

        if(attackers.length < Game.flags.spawnAttack.color) {
            this.roomai.spawn(spawnHelper.bestAvailableParts(this.room, attacker.meleeConfigs()), { role: attacker.name, flag: "attack" });
        }
    }

    claimRoom() {
        if(!(Game.flags.spawnClaim && Game.flags.spawnClaim.pos.roomName == this.room.name)) {
            return;
        }

        if(!Game.flags.claim) return;
        if(!this.roomai.canSpawn()) return;

        let targetRoom = Game.flags.claim.room;
        if(targetRoom && targetRoom.find(FIND_MY_SPAWNS).length > 0) {
            this.kickstartRoom(targetRoom);
        } else {
            let claimers = spawnHelper.globalCreepsWithRole(claimer.name);
            let conquerors = spawnHelper.globalCreepsWithRole(conqueror.name);
            let needClaimer = claimers.length == 0 && !(targetRoom && targetRoom.controller.my);

            if(needClaimer) {
                this.roomai.spawn(claimer.parts, { role: claimer.name });
            }

            if(conquerors.length < 2) {
                this.roomai.spawn(spawnHelper.bestAvailableParts(this.room, conqueror.configs()), { role: conqueror.name });
            }
        }
    }

    kickstartRoom(remoteRoom) {
        if(remoteRoom.controller.level > 4) return;

        for(let source of remoteRoom.find(FIND_SOURCES)) {
            // only considering maxed out miners
            let hasMiner = _.any(spawnHelper.globalCreepsWithRole(miner.name), (c) => c.memory.target == source.id && miner.countWorkParts(c) == 5);
            if(!hasMiner) {
                this.roomai.spawn(spawnHelper.bestAvailableParts(this.room, miner.energyConfigs), { role: miner.name, target: source.id, resource: RESOURCE_ENERGY, selfSustaining: true });
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ManualOperationsAspect');
