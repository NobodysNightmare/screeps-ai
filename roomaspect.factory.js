const spawnHelper = require("helper.spawning");
const factoryWorker = require("role.factoryWorker");

module.exports = class FactoryAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.factory = roomai.factory;
        this.workers = this.room.find(FIND_MY_CREEPS, { filter: (c) => c.memory.role == factoryWorker.name });
    }

    run() {
        if(!this.room.storage || !this.factory.isAvailable()) return;
        if(this.roomai.defense.defcon >= 4) return;
        if(Game.cpu.bucket < 3000) {
            return;
        }

        // TODO: tell factory what to do build?

        this.runFactory();

        this.buildWorkers();
    }

    runFactory() {
        if(!this.factory.product) return;
        if(this.factory.structure.cooldown > 0) return;

        let product = this.factory.nextProduction();
        if(!product) return;

        this.factory.structure.produce(product);
    }

    buildWorkers() {
        if(!this.roomai.canSpawn()) return;
        if(this.room.storage.store.energy < 275000) return;

        let needToWork = this.factory.product; // TODO: figure out whether spawning is necessary
        if(needToWork) {
            if(spawnHelper.numberOfLocalCreeps(this.roomai, factoryWorker.name) >= 1) return;

            this.roomai.spawn(factoryWorker.parts, { role: factoryWorker.name });
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'FactoryAspect');
