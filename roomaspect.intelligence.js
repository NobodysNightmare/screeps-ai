const spawnHelper = require("helper.spawning");
const roomNameHelper = require("helper.roomName");

const discoverer = require("role.discoverer");

module.exports = class IntelligenceAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
    }

    run() {
        if(!this.roomai.intervals.scanRooms.isActive()) return;
        if(this.room.controller.level < 3) return;

        let scanQueue = _.map(roomNameHelper.roomNamesAround(this.room.name, 10), (r) => this.roomInfo(r));
        let minAge = Game.time - this.roomai.intervals.scanRooms.period;
        scanQueue = _.sortBy(_.filter(scanQueue, (e) => e.updated < minAge), (e) => e.updated);

        if(this.roomai.observer.isAvailable()) {
            for(let roomInfo of _.take(scanQueue, 50)) {
                this.roomai.observer.observeLater(roomInfo.room);
                roomInfo.knowledge.lastScan = Game.time;
            }
        } else {
            scanQueue = _.take(scanQueue, 12);
            let spawned = this.roomai.spawn(discoverer.parts, { role: discoverer.name, targets: _.map(scanQueue, (ri) => ri.room) });
            if(_.isString(spawned)) {
                _.forEach(scanQueue, (ri) => ri.knowledge.lastScan = Game.time);
            }
        }
    }

    roomInfo(roomName) {
        let knowledge = MapKnowledge.roomKnowledge(roomName);
        return {
            room: roomName,
            updated: _.max([0, knowledge.lastUpdate, knowledge.lastScan]),
            knowledge: knowledge
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'IntelligenceAspect');
