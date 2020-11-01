const roomNameHelper = require("helper.roomName");

const cpuSamplingTicks = 1500;
const targetCpuUtilization = 0.9;
const maximumSupportDistance = 8;

const mineralBaseAmounts = _.mapValues(MINERAL_MIN_AMOUNT, (m) => 0);

module.exports = class ExpansionPlanner {
    constructor() {
        if(!Memory.expansionPlanner) Memory.expansionPlanner = {};

        this.memory = Memory.expansionPlanner;
    }

    run() {
        if(Memory.disableAutoExpansion) return;
        if(Game.time % 2000 !== 0) return;
        if(this.roomCount >= this.cpuRoomCap || this.roomCount >= this.gclRoomCap) return;

        let hasIncompleteClaimOperation = _.find(Operation.operations, (o) => o.type === "claim" && !(o.spawnPosition.room && o.spawnPosition.room.controller.my))
        if(hasIncompleteClaimOperation) return;

        let rooms = this.selectNewRooms();
        if(rooms.length === 0) return;

        let room = rooms[0];
        let withBuilders = Game.rooms[room.supportRoom].controller.level >= 7
        Operation.createOperation("claim", { supportRoom: room.supportRoom, spawnPosition: new AbsolutePosition(new RoomPosition(25, 25, room.name)), autoPlanRoom: true, spawnBuilders: withBuilders });
    }

    drawRoomScores() {
        for(let room of MapKnowledge.knowledgeList()) {
            if(!room.knowledge.lastUpdate) continue;

            let score = this.scoreRoom(room.name, room.knowledge);
            Game.map.visual.text(score, new RoomPosition(42, 5, room.name), { fontSize: 8, color: "#ffffff", align: 'center', opacity: 1.0 });
        }
    }

    get averageCpu() {
        return this.memory.averageCpu || 500;
    }

    get cpuRoomCap() {
        let cpuPerRoom = this.averageCpu / Math.max(_.filter(Game.rooms, (r) => r.ai() && r.controller.level >= 5).length, 1);
        return Math.floor((targetCpuUtilization * Game.cpu.limit) / cpuPerRoom);
    }

    get gclRoomCap() {
        return Game.gcl.level;
    }

    get roomCount() {
        return _.filter(Game.rooms, (r) => r.ai()).length;
    }

    get minerals() {
        if(!this._minerals) {
            let mineralAmounts = _.mapValues(_.groupBy(_.map(_.filter(Game.rooms, (r) => r.ai()), (r) => MapKnowledge.roomKnowledge(r).mineral), (m) => m), (rooms) => rooms.length);
            mineralAmounts = { ...mineralBaseAmounts, ...mineralAmounts };
            this._minerals = { amounts: mineralAmounts, min: _.min(mineralAmounts), max: _.max(mineralAmounts) };
        }

        return this._minerals;
    }

    selectNewRooms() {
        let minSupportLevel = this.roomCount > 1 ? 4 : 3;
        let supportRooms = _.map(_.filter(Game.rooms, (r) => r.ai() && r.controller.level >= minSupportLevel), (r) => r.name);
        if(supportRooms.length === 0) return [];

        let claimables = _.filter(MapKnowledge.knowledgeList(), (r) => r.knowledge.claimable && !r.knowledge.owner);
        for(let room of claimables) {
            room.score = this.scoreRoom(room.name, room.knowledge);
        }
        claimables = _.sortBy(claimables, (r) => -r.score);
        claimables = _.takeWhile(claimables, (r) => r.score === claimables[0].score);

        for(let room of claimables) {
            room.supportRoom = _.sortBy(supportRooms, (r) => Game.map.getRoomLinearDistance(room.name, r))[0];
            if(room.supportRoom) room.supportDistance = Game.map.getRoomLinearDistance(room.name, room.supportRoom);
        }

        // TODO: consider all rooms, not just top scorers
        claimables = _.sortBy(_.filter(claimables, (r) => r.supportDistance <= maximumSupportDistance), (r) => r.supportDistance);

        return claimables;
    }

    scoreRoom(name, knowledge) {
        let mineralScore = this.minerals.max - this.minerals.amounts[knowledge.mineral];
        if(mineralScore >= this.minerals.max - this.minerals.min) mineralScore *= 3;
        let sourcesScore = 1.5 * knowledge.sources;
        let highwayScore = roomNameHelper.isCloseToHighway(name) ? 0.5 : 0;

        return mineralScore + sourcesScore + highwayScore;
    }

    static sampleCpuUsage() {
        let memory = Memory.expansionPlanner;
        memory.sampledCpuSum = (memory.sampledCpuSum || 0) + Game.cpu.getUsed();
        memory.sampledCpuTicks = (memory.sampledCpuTicks || 0) + 1;

        if(memory.sampledCpuTicks >= cpuSamplingTicks) {
            memory.averageCpu = memory.sampledCpuSum / cpuSamplingTicks;

            memory.sampledCpuSum = 0;
            memory.sampledCpuTicks = 0;
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ExpansionPlanner');
