module.exports = class FactoryOperator {
    constructor(creep) {
        this.creep = creep;
    }

    run() {
        this.generateOps();
        if(this.goHome()) return;
        if(this.renewPower()) return;
        if(this.enableRoom()) return;
        if(this.operateFactory()) return;
    }

    runUnspawned() {
        if(this.spawnCooldownTime > 0) return;

        let homeRoom = Game.rooms[this.creep.memory.home];
        if(!homeRoom) return;

        this.creep.spawn(homeRoom.powerSpawn());
    }

    generateOps() {
        if(this.creep.powers[PWR_GENERATE_OPS].cooldown == 0) {
            this.creep.usePower(PWR_GENERATE_OPS);
        }
    }

    goHome() {
        let homeRoom = Game.rooms[this.creep.memory.home];
        if(!homeRoom || this.creep.room.name == homeRoom.name) return false;

        this.creep.goTo(homeRoom.powerSpawn());

        return true;
    }

    renewPower() {
        if(this.creep.ticksToLive < 200) {
            let powerSpawn = this.creep.room.powerSpawn();
            if(this.creep.pos.isNearTo(powerSpawn)) {
                this.creep.renew(powerSpawn);
            } else {
                this.creep.goTo(powerSpawn);
            }

            return true;
        } else {
            return false;
        }
    }

    enableRoom() {
        let controller = this.creep.room.controller;
        if(!controller || controller.isPowerEnabled) return false;

        if(this.creep.pos.isNearTo(controller)) {
            this.creep.enableRoom(controller);
        } else {
            this.creep.goTo(controller);
        }

        return true;
    }

    operateFactory() {
        let roomai = this.creep.room.ai();
        if(!roomai) return;

        let factory = roomai.factory.isAvailable() && roomai.factory.structure;
        if(!factory) return;

        let powerMetadata = POWER_INFO[PWR_OPERATE_FACTORY];

        if(this.creep.pos.getRangeTo(factory) <= powerMetadata.range) {
            if(this.creep.store.ops < powerMetadata.ops) return;
            if(this.creep.powers[PWR_OPERATE_FACTORY].cooldown > 0) return;
            this.creep.usePower(PWR_OPERATE_FACTORY, factory);
        } else {
            this.creep.goTo(factory, { range: powerMetadata.range });
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'FactoryOperator');
