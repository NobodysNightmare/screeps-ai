const spawnHelper = require("helper.spawning");

module.exports = {
    name: "scientist",
    parts: spawnHelper.makeParts(10, CARRY, 5, MOVE),
    run: function(creep) {
        if(!creep.room.ai()) {
            console.log("Scientist is in AI-less room " + creep.room.name);
            return;
        }

        let reactor = creep.room.ai().labs.reactor;
        if(creep.memory.state === "deliver") {
            this.deliverToReactor(creep, reactor);
        } else if(creep.memory.state === "deliverBoost") {
            this.deliverBoost(creep, reactor);
        } else if(creep.memory.state === "pickAtReactor") {
            this.pickAtReactor(creep, reactor);
        } else if(creep.memory.state === "store") {
            this.store(creep, reactor);
        } else if(creep.memory.state === "pickAtStorage") {
            this.pickAtStorage(creep, reactor);
        } else if(creep.memory.state === "pickAtBooster") {
            this.pickAtBooster(creep, reactor);
        } else {
            // by default move to store
            this.store(creep, reactor);
        }
    },
    deliverToReactor: function(creep, reactor) {
        let target = null;
        let resource = Object.keys(creep.carry)[1];
        if(resource == reactor.baseMinerals[0]) target = reactor.inputs[0];
        if(resource == reactor.baseMinerals[1]) target = reactor.inputs[1];
        if(!target) {
            if(resource) {
                // carry contains invalid resource
                creep.memory.state = "store";
                return;
            } else {
                // TODO: move to reactor rally point
                target = reactor.outputs[0];
            }
        }

        if(creep.pos.isNearTo(target)) {
            creep.transfer(target, resource);
            creep.memory.state = "pickAtReactor";
            this.pickAtReactor(creep, reactor);
        } else {
            creep.goTo(target, { newPathing: true });
        }
    },
    pickAtReactor: function(creep, reactor) {
        let target = _.find(reactor.outputs, (l) => l.mineralAmount > 0);
        if(!reactor.inputSatisfied(0)) target = reactor.inputs[0];
        if(!reactor.inputSatisfied(1)) target = reactor.inputs[1];

        if(!target || target.mineralAmount === 0 || _.sum(creep.carry) === creep.carryCapacity) {
            creep.memory.state = "store";
            this.store(creep, reactor);
        } else if(creep.withdraw(target, target.mineralType) === ERR_NOT_IN_RANGE) {
            creep.goTo(target, { newPathing: true });
        }
    },
    store: function(creep) {
        let target = creep.room.storage;
        if(!target) return;

        let resource = Object.keys(creep.carry)[1];
        if(creep.pos.isNearTo(target)) {
            creep.transfer(target, resource);
            creep.memory.state = "pickAtStorage";
        } else {
            creep.goTo(target, { newPathing: true });
        }
    },
    pickAtStorage: function(creep, reactor) {
        if(!reactor) {
            // boost-only operation
            if(this.pickupBoost(creep)) {
                creep.memory.state = "deliverBoost";
            }
            return;
        }
        let resources = [];
        if(reactor.inputSatisfied(0) && reactor.inputs[0].mineralAmount < reactor.inputs[0].mineralCapacity) {
            resources.push({ type: reactor.baseMinerals[0], amount: reactor.inputs[0].mineralAmount });
        }
        if(reactor.inputSatisfied(1) && reactor.inputs[1].mineralAmount < reactor.inputs[1].mineralCapacity) {
            resources.push({ type: reactor.baseMinerals[1], amount: reactor.inputs[1].mineralAmount });
        }

        resources = _.sortBy(_.filter(resources, (r) => creep.room.storage.store[r.type]), (r) => r.amount);
        let resource = resources[0];
        if(resource) {
            let actualAmount = (creep.room.storage.store[reactor.compound] || 0) + _.sum(reactor.outputs, (l) => l.mineralAmount);
            let neededProduce = reactor.targetAmount - actualAmount;
            let missingInput = Math.max(0, neededProduce - resource.amount);
            let inStore = creep.room.storage.store[resource.type] || 0;
            if(missingInput > 0 && inStore > 0) {
                missingInput = Math.max(5, missingInput);
                creep.withdraw(creep.room.storage, resource.type, Math.min(creep.carryCapacity, missingInput, inStore));
            } else {
                if(this.pickupBoost(creep)) {
                    creep.memory.state = "deliverBoost";
                    return;
                }
            }
        } else {
            if(this.pickupBoost(creep)) {
                creep.memory.state = "deliverBoost";
                return;
            }
        }

        creep.memory.state = "deliver";
    },
    pickupBoost: function(creep) {
        let target = _.sortBy(_.filter(creep.room.ai().labs.boosters, (b) => b.lab.energy < b.lab.energyCapacity), (b) => b.lab.energy)[0];
        if(target) {
            creep.withdraw(creep.room.storage, RESOURCE_ENERGY, Math.min(target.lab.energyCapacity - target.lab.energy, creep.carryCapacity));
            return true;
        } else {
            target = _.sortBy(_.filter(creep.room.ai().labs.boosters, (b) => b.resource && creep.room.storage.store[b.resource] && (!b.lab.mineralType || b.resource === b.lab.mineralType) && b.lab.mineralAmount < b.lab.mineralCapacity), (b) => b.lab.mineralAmount)[0];
            if(target) {
                let amount = Math.min(target.lab.mineralCapacity - target.lab.mineralAmount, creep.carryCapacity, creep.room.storage.store[target.resource]);
                if(amount > 0) {
                    creep.withdraw(creep.room.storage, target.resource, amount);
                    return true;
                }

                // Can' fill other boosters, but still has booster with wrong resource loaded
                if(_.find(creep.room.ai().labs.boosters, (b) => b.resource && b.lab.mineralType && b.lab.mineralType !== lab.resource)) {
                    return true;
                }
            } else if(_.find(creep.room.ai().labs.boosters, (b) => b.resource && b.lab.mineralAmount > 0 && b.resource !== b.lab.mineralType)) {
                // clean booster with wrong resource
                return true;
            }
        }

        return false;
    },
    deliverBoost: function(creep) {
        let creepMineral = Object.keys(creep.carry)[1];
        let target = null;
        if(_.sum(creep.carry) > 0) {
            if(creepMineral) {
                target = _.find(creep.room.ai().labs.boosters, (b) => b.resource === creepMineral);
            } else {
                target = _.sortBy(creep.room.ai().labs.boosters, (b) => b.lab.energy)[0];
            }
        } else {
            target = _.find(creep.room.ai().labs.boosters, (b) => b.resource && b.resource !== b.lab.mineralType);
        }

        if(!target) {
            creep.memory.state = "store";
        } else {
            let transferResult = creep.transfer(target.lab, creepMineral || RESOURCE_ENERGY);
            if(transferResult === ERR_NOT_IN_RANGE) {
                creep.goTo(target.lab, { newPathing: true });
            } else {
                creep.memory.state = "pickAtBooster";
            }
        }
    },
    pickAtBooster: function(creep, reactor) {
        // we might be close to multiple boosters
        let boosters = _.filter(creep.room.ai().labs.boosters, (b) => b.lab.mineralType !== b.resource && creep.pos.isNearTo(b.lab));
        if(boosters.length > 0) {
            let booster = boosters[0];
            creep.withdraw(booster.lab, booster.lab.mineralType);
        }

        creep.memory.state = "store";
        this.store(creep, reactor);
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'scientist');
