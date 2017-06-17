const spawnHelper = require("helper.spawning");
const scientist = require("role.scientist");

const targetCompounds = ["XLH2O", "XGH2O", "XLHO2", "XGHO2", "G"];
const reactionCycleAmount = 2500;

module.exports = class LabsAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.labs = roomai.labs.all;
        this.decompose = roomai.labs.decompose;

        this.reactor = roomai.labs.reactor;
        this.boosters = roomai.labs.boosters;
        this.scientists = this.room.find(FIND_MY_CREEPS, { filter: (c) => c.memory.role == scientist.name });
    }

    run() {
        if(!this.room.storage || !this.reactor || !this.reactor.isValid()) return;
        if(Game.cpu.bucket < 5000) {
            return;
        }

        this.setCurrentReaction();
        this.buildScientists();
        this.reactor.react();
        this.reactor.renderVisuals();
        for(let booster of this.boosters) {
            booster.renderVisuals();
        }
    }

    setCurrentReaction() {
        if(!this.isCurrentReactionFinished()) return;

        let nextReaction = this.findNextReaction();
        this.reactor.setupReaction(nextReaction, this.amount(nextReaction) + reactionCycleAmount);
    }

    isCurrentReactionFinished() {
        let currentReaction = this.reactor.compound;
        if(!currentReaction) return true;
        if(_.any(this.decompose(currentReaction), (r) => this.amount(r) < LAB_REACTION_AMOUNT)) return true;

        return this.amount(currentReaction) >= this.reactor.targetAmount;
    }

    findNextReaction() {
        let targets = _.sortBy(_.filter(targetCompounds, (r) => this.amount(r) < this.roomai.trading.baselineAmount(r)), (r) => this.amount(r));
        for(let target of targets) {
            let missing = [target];
            while(missing.length > 0) {
                let nextReaction = missing[0];
                missing = _.filter(this.decompose(nextReaction), (r) => this.amount(r) === 0);
                if(missing.length === 0) return nextReaction;

                // filter uncookable resources (e.g. H). Can't get those using reactions.
                missing = _.filter(missing, (r) => this.decompose(r));
            }
        }

        return null;
    }

    amount(resource) {
        if(!resource) return 0;
        let storageAmount = this.room.storage.store[resource] || 0;
        let labAmount = _.sum(_.filter(this.labs, (l) => l.mineralType == resource), (l) => l.mineralAmount);
        let scientistAmount = _.sum(this.scientists, (c) => c.carry[resource] || 0);

        return storageAmount + labAmount + scientistAmount;
    }

    buildScientists() {
        // TODO: also build scientist for filling boosts
        if(!this.reactor.compound || !this.roomai.canSpawn()) return;
        if(spawnHelper.numberOfLocalCreeps(this.roomai, scientist.name) >= 1) return;

        this.roomai.spawn(scientist.parts, { role: scientist.name });
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'LabsAspect');
