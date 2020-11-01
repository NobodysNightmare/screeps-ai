module.exports = class Intervals {
    constructor() {
        this.transferResources = new Interval(5);
        this.buildStructure = new Interval(100);
        this.scanRooms = new Interval(1500);
        this.planRemoteMines = new Interval(2000);
    }
}

class Interval {
    constructor(period) {
        this.period = period;
        this.age = Game.time % this.period;
    }

    isActive() {
        return this.age === 0;
    }

    isActiveIn(ticks) {
        // wrap high tick length into the length of a period
        let leadTime = ticks % this.period;

        return this.age === (this.period - leadTime) % this.period;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(Interval, 'Intervals.Interval');
profiler.registerClass(module.exports, 'Intervals');
