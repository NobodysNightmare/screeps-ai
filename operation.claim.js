const spawnHelper = require("helper.spawning");
const builder = require("role.builder");
const claimer = require("role.claimer");
const conqueror = require("role.conqueror");
const miner = require("role.miner");

const BuildProxy = require("construction.buildproxy");

const cleanableStructures = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_TOWER,
    STRUCTURE_RAMPART,
    STRUCTURE_LINK
];

module.exports = class ClaimOperation extends Operation {
    constructor(memory) {
        super(memory);

        this.spawnQueue = [];
    }

    get spawnPosition() {
        if(!this.memory.spawnPosition) return null;
        return AbsolutePosition.deserialize(this.memory.spawnPosition);
    }

    set spawnPosition(pos) {
        this.memory.spawnPosition = pos.toJSON();
    }

    isValid() {
        return super.isValid() && this.spawnPosition;
    }

    run() {
        if(!this.isValid()) return;

        let targetRoom = this.spawnPosition.room;
        if(targetRoom && targetRoom.find(FIND_MY_SPAWNS).length > 0) {
            if(targetRoom.controller.level > 4) {
                Operation.removeOperation(this);
                return;
            }

            this.kickstartRoom(targetRoom);
            this.cleanHostileStructures(targetRoom);
        } else {
            this.conquerRoom(targetRoom);
        }
    }

    supportRoomCallback(room) {
        if(!this.isValid()) return;

        let spawnRequest = null;

        while((spawnRequest = this.spawnQueue.shift()) && room.ai().canSpawn()) {
            room.ai().spawn(spawnHelper.bestAvailableParts(room, spawnRequest.configs), spawnRequest.memory);
        }
    }

    drawVisuals() {
        let spawnPos = this.spawnPosition;
        if(spawnPos) {
            let visual = new RoomVisual(spawnPos.roomName);

            visual.circle(spawnPos.x, spawnPos.y, { stroke: "#f77", fill: null, radius: 0.5 });
            RoomUI.forRoom(spawnPos.roomName).addRoomCaption(`Claiming from ${this.memory.supportRoom}`);
        }
    }

    conquerRoom(remoteRoom) {
        let claimers = _.filter(spawnHelper.globalCreepsWithRole(claimer.name), (c) => c.memory.operation == this.id);
        let conquerors = _.filter(spawnHelper.globalCreepsWithRole(conqueror.name), (c) => c.memory.operation == this.id);
        let myRoom = remoteRoom && remoteRoom.controller.my;
        let needClaimer = claimers.length == 0 && !myRoom;

        if(needClaimer) {
            let roomCount = _.filter(Game.rooms, (r) => r.controller && r.controller.my).length;
            if(roomCount >= Game.gcl.level) {
                // do not spawn anything if we don't own the room and can't claim it yet
                return;
            }

            this.spawnQueue.push({
                configs: [claimer.parts],
                memory: { role: claimer.name, target: this.spawnPosition, operation: this.id }
            });
        }

        if(conquerors.length < 2) {
            this.spawnQueue.push({
                configs: conqueror.configs(),
                memory: { role: conqueror.name, target: this.spawnPosition, operation: this.id }
            });
        }

        if(myRoom) {
            if(this.memory.autoPlanRoom) {
                if(!this.memory.roomPlanned) {
                    remoteRoom.ai().constructions.planRoomLayout();
                    this.memory.roomPlanned = true;
                }

                let spawn = _.find(remoteRoom.ai().constructions.buildings, (b) => b.type === "spawn");
                if(spawn) {
                    let buildProxy = new BuildProxy(remoteRoom);
                    spawn.build(buildProxy);
                    buildProxy.commit();
                }
            } else {
                remoteRoom.createConstructionSite(this.spawnPosition, STRUCTURE_SPAWN);
            }

            this.cleanHostileStructures(remoteRoom);
        }
    }

    kickstartRoom(remoteRoom) {
        for(let source of remoteRoom.find(FIND_SOURCES)) {
            // only considering maxed out miners
            let hasMiner = _.any(spawnHelper.globalCreepsWithRole(miner.name), (c) => c.memory.target == source.id && miner.countWorkParts(c) == 5);
            if(!hasMiner) {
                this.spawnQueue.push({
                    configs: miner.energyConfigs,
                    memory: { role: miner.name, target: source.id, resource: RESOURCE_ENERGY, selfSustaining: true, operation: this.id }
                });
            }
        }

        if(this.memory.spawnBuilders) {
            let hasBuilders = _.filter(spawnHelper.globalCreepsWithRole(builder.name), (c) => c.memory.room === remoteRoom.name).length >= 2;
            if(!hasBuilders) {
                this.spawnQueue.push({
                    configs: builder.configs(10),
                    memory: { role: builder.name, room: remoteRoom.name, operation: this.id }
                });
            }
        }
    }

    cleanHostileStructures(remoteRoom) {
        if(remoteRoom.storage && !remoteRoom.storage.my) {
            if(remoteRoom.storage.store.energy <= 2000) remoteRoom.storage.destroy();
        }

        let hostileStructures = remoteRoom.find(FIND_HOSTILE_STRUCTURES);
        for(let structure of hostileStructures) {
            if(cleanableStructures.includes(structure.structureType)) structure.destroy();
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ClaimOperation');
