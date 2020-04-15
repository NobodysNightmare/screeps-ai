const spawnFlagRegex = /^spawn([A-Za-z]+)([0-9]+)$/;
const operations = {
  deposits: require("operation.farmDeposits"),
  power: require("operation.farmPower"),
  ranger: require("operation.ranger")
};

module.exports = class ManualOperationsAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
    }

    run() {
        let results = _.filter(_.map(this.room.find(FIND_FLAGS), (f) => ({ match: spawnFlagRegex.exec(f.name), flag: f })), (m) => m.match);
        for(let result of results) {
            let opName = result.match[1].toLowerCase();
            let opId = result.match[2];
            let targetFlag = Game.flags[opName + opId];
            let operation = operations[opName];
            if(operation && (targetFlag || operation.canSkipFlag)) {
                new operation(this.roomai, targetFlag, result.flag.color, result.flag.secondaryColor).run();
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ManualOperationsAspect');
