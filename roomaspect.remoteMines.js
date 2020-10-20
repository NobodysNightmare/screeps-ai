const carrier = require('role.carrier');
const defender = require('role.defender');
const miner = require('role.miner');
const observer = require('role.observer');
const reserver = require('role.reserver');

const logistic = require("helper.logistic");
const spawnHelper = require("helper.spawning");
const ff = require("helper.friendFoeRecognition");

const profitVisual = require("visual.roomProfit");

const energyExcessThreshold = 20000;
const secondCarrierMinCapacity = 400;

const targetRemoteMineCount = 2;

function isAcceptableMine(roomName) {
    let knowledge = MapKnowledge.roomKnowledge(roomName);
    if(!knowledge) return false;
    // mines need a source, but should not be center rooms (which have hostile NPCs)
    if(knowledge.sources < 1 || knowledge.sources > 2) return false;
    if(knowledge.owner) return false;

    // has another room already chosen this mine?
    if(knowledge.remoteMineOf) {
        let ownerRoom = Game.rooms[knowledge.remoteMineOf];
        if(ownerRoom && ownerRoom.ai()) return false;
    }

    return true;
}

module.exports = class RemoteMinesAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
        if(!this.room.memory.remoteMines) this.room.memory.remoteMines = [];
        this.remoteMines = this.room.memory.remoteMines;
    }

    run() {
        if(!this.room.storage) return;
        if(this.remoteMines.length < targetRemoteMineCount) {
           if(!Memory.disableAutoExpansion && Game.time % 2000 === 0) {
               this.planRemoteMines();
           }
        }

        // TODO: only disable endangered remote mines
        if(this.roomai.defense.defcon >= 3) return;

        let hasExcessEnergy = this.roomai.trading.requiredExportFromRoom(RESOURCE_ENERGY) >= energyExcessThreshold;

        for(var roomName of this.remoteMines) {
            var remoteRoom = Game.rooms[roomName];
            if(remoteRoom) {
                if(this.isInvaderRoom(remoteRoom)) continue;
                if(this.spawnDefender(remoteRoom)) continue;

                this.spawnReserver(remoteRoom);

                if(hasExcessEnergy) continue;

                for(let source of remoteRoom.find(FIND_SOURCES)) {
                    this.spawnMiner(source);
                    this.spawnCarrier(source);
                }
            } else {
                // TODO: restrict spawning to once every few (500?) ticks
                //       (avoiding overproduction during siege)
                this.spawnObserver(roomName);
            }
        }
    }

    isInvaderRoom(remoteRoom) {
        let remoteOwner = remoteRoom.controller.reservation && remoteRoom.controller.reservation.username;
        return remoteOwner === 'Invader';
    }

    spawnDefender(remoteRoom) {
        let remoteOwner = remoteRoom.controller.owner && remoteRoom.controller.owner.username;
        var hostile = ff.findHostiles(remoteRoom, { filter: (c) => c.owner.username !== remoteOwner })[0];
        if(!hostile) return false;

        if(!this.roomai.canSpawn()) return true;
        if(this.roomai.defense.defcon >= 3) return true;

        var hasDefender = _.any(spawnHelper.globalCreepsWithRole(defender.name), (c) => c.memory.room == remoteRoom.name);
        if(!hasDefender) {
            this.spawn(spawnHelper.bestAvailableParts(this.room, defender.meeleeConfigs()), { role: defender.name, room: remoteRoom.name, originRoom: this.room.name }, remoteRoom.name);
        }

        return true;
    }

    spawnReserver(remoteRoom) {
        if(!this.roomai.canSpawn()) return;

        var needReservation = !remoteRoom.controller.owner && (!remoteRoom.controller.reservation || remoteRoom.controller.reservation.ticksToEnd < 2000);
        var hasReserver = _.any(spawnHelper.globalCreepsWithRole(reserver.name), (c) => c.memory.target == remoteRoom.controller.id);
        if(needReservation && !hasReserver) {
            this.spawn(spawnHelper.bestAvailableParts(this.room, reserver.partConfigs), { role: reserver.name, target: remoteRoom.controller.id }, remoteRoom.name);
        }
    }

    spawnMiner(source) {
        if(!this.roomai.canSpawn()) return;

        var hasMiner = _.any(spawnHelper.globalCreepsWithRole(miner.name), (c) => c.memory.target == source.id);
        if(!hasMiner) {
            this.spawn(spawnHelper.bestAvailableParts(this.room, miner.energyConfigs), { role: miner.name, target: source.id, targetRoom: source.room.name, resource: RESOURCE_ENERGY, selfSustaining: true }, source.room.name);
        }
    }

    spawnCarrier(source) {
        if(!this.roomai.canSpawn()) return;

        let hasStore = logistic.storeFor(source);
        let carrierCapacity = _.sum(_.filter(spawnHelper.globalCreepsWithRole(carrier.name), (c) => c.memory.source == source.id), (c) => _.filter(c.body, (p) => p.type === CARRY).length) * CARRY_CAPACITY;
        let neededCapacity = this.neededCollectorCapacity(source);
        let missingCapacity = neededCapacity - carrierCapacity;
        if(hasStore && (carrierCapacity == 0 || missingCapacity >= secondCarrierMinCapacity)) {
            let memory = {
                role: carrier.name,
                source: source.id,
                destination: this.room.storage.id,
                resource: RESOURCE_ENERGY,
                selfSustaining: true,
                registerRevenueFor: source.room.name
            };
            this.spawn(spawnHelper.bestAvailableParts(this.room, carrier.configsForCapacity(missingCapacity, { workParts: 1 })), memory, source.room.name);
        }
    }

    spawnObserver(roomName) {
        if(!_.any(spawnHelper.globalCreepsWithRole(observer.name), (c) => c.memory.target == roomName)) {
            this.spawn(observer.parts, { role: observer.name, target: roomName }, roomName);
        }
    }

    neededCollectorCapacity(source) {
        // back and forth while 10 energy per tick are generated
        var needed = logistic.distanceByPath(source, this.room.storage) * 20;
        // adding at least one extra CARRY to make up for inefficiencies
        return _.min([needed + 60, 2000]);
    }

    spawn(parts, memory, targetRoom) {
        let result = this.roomai.spawn(parts, memory);
        if(_.isString(result)) {
            profitVisual.addCost(targetRoom, spawnHelper.costForParts(parts));
        }
    }

    planRemoteMines() {
        let missingMines = targetRemoteMineCount - this.remoteMines.length

        let candidates = this.possibleRemoteMines(Object.values(Game.map.describeExits(this.room.name)));
        for(let roomName of _.take(candidates, missingMines)) {
            this.addRemoteMine(roomName);
            missingMines--;
        }

        if(missingMines > 0) {
            candidates = this.possibleRemoteMines(_.flatten(_.map(this.remoteMines, (r) => Object.values(Game.map.describeExits(r)))));
            for(let roomName of _.take(candidates, missingMines)) this.addRemoteMine(roomName);
        }
    }

    possibleRemoteMines(roomNames) {
        roomNames = _.filter(roomNames, (r) => r !== this.room.name && !this.remoteMines.includes(r) && isAcceptableMine(r));
        return _.sortBy(roomNames, (r) => -MapKnowledge.roomKnowledge(r).sources);
    }

    addRemoteMine(roomName) {
        this.remoteMines.push(roomName);
        MapKnowledge.roomKnowledge(roomName).remoteMineOf = this.room.name;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'RemoteMinesAspect');
