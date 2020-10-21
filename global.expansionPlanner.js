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

        let mineralAmounts = _.mapValues(_.groupBy(_.map(_.filter(Game.rooms, (r) => r.ai()), (r) => MapKnowledge.roomKnowledge(r).mineral), (m) => m), (rooms) => rooms.length);
        mineralAmounts = { ...mineralBaseAmounts, ...mineralAmounts };
        this.minerals = { amounts: mineralAmounts, min: _.min(mineralAmounts), max: _.max(mineralAmounts) };

        let rooms = this.selectNewRooms();
        if(rooms.length === 0) return;

        let room = rooms[0];
        let withBuilders = Game.rooms[room.supportRoom].controller.level >= 7
        Operation.createOperation("claim", { supportRoom: room.supportRoom, spawnPosition: new AbsolutePosition(new RoomPosition(25, 25, room.name)), autoPlanRoom: true, spawnBuilders: withBuilders });
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

    selectNewRooms() {
        let minSupportLevel = this.roomCount > 1 ? 4 : 3;
        let supportRooms = _.map(_.filter(Game.rooms, (r) => r.ai() && r.controller.level >= minSupportLevel), (r) => r.name);
        if(supportRooms.length === 0) return [];

        let claimables = _.filter(MapKnowledge.knowledgeList(), (r) => r.knowledge.claimable && !r.knowledge.owner);
        for(let room of claimables) {
            room.score = this.scoreRoom(room.knowledge);
        }
        claimables = _.sortBy(claimables, (r) => -r.score);
        claimables = _.takeWhile(claimables, (r) => r.score === claimables[0].score);

        for(let room of claimables) {
            room.supportRoom = _.sortBy(supportRooms, (r) => Game.map.getRoomLinearDistance(room.name, r))[0];
            if(room.supportRoom) room.supportDistance = Game.map.getRoomLinearDistance(room.name, room.supportRoom);
        }

        // TODO: if all the best rooms are outside supportDistance, we will not expand further
        claimables = _.sortBy(_.filter(claimables, (r) => r.supportDistance <= maximumSupportDistance), (r) => r.supportDistance);

        return claimables;
    }

    scoreRoom(knowledge) {
        let mineralScore = this.minerals.max - this.minerals.amounts[knowledge.mineral];
        if(mineralScore >= this.minerals.max - this.minerals.min) mineralScore *= 3;
        let sourcesScore = 1.5 * knowledge.sources;

        return mineralScore + sourcesScore;
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
