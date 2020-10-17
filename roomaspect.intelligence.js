const spawnHelper = require("helper.spawning");
const roomNameHelper = require("helper.roomName");

const discoverer = require("role.discoverer");

module.exports = class IntelligenceAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
    }

    run() {
        // TODO: distribute active tick ("0") randomly
        // so that not all rooms send out creeps/scans at the same time
        if(Game.time % 1500 !== 0) return;
        if(this.room.controller.level < 3) return;

        let scanQueue = _.map(
            roomNameHelper.roomNamesAround(this.room.name, 10),
            (r) => ({ room: r, updated: MapKnowledge.roomKnowledge(r).lastUpdate || 0 })
        );
        let minAge = Game.time - 1500;
        scanQueue = _.map(_.take(_.sortBy(_.filter(scanQueue, (e) => e.updated < minAge), (e) => e.updated), 20), e => e.room);

        if(this.roomai.observer.isAvailable()) {
            for(let room of scanQueue) this.roomai.observer.observeLater(room);
        } else {
            this.roomai.spawn(discoverer.parts, { role: discoverer.name, targets: scanQueue });
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'IntelligenceAspect');
