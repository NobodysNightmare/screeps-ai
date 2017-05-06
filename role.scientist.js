const spawnHelper = require("helper.spawning");

module.exports = {
    name: "scientist",
    parts: spawnHelper.makeParts(10, CARRY, 5, MOVE),
    run: function(creep) {
        let reactor = creep.room.ai().labs.reactor;
        if(creep.memory.state === "deliver") {
            this.deliverToReactor(creep, reactor);
        } else if(creep.memory.state === "pickAtReactor") {
            this.pickAtReactor(creep, reactor);
        } else if(creep.memory.state === "store") {
            this.store(creep, reactor);
        } else if(creep.memory.state === "pickAtStorage") {
            this.pickAtStorage(creep, reactor);
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
            creep.moveTo(target);
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
            creep.moveTo(target);
        }
    },
    store: function(creep, reactor) {
        let target = creep.room.storage;
        if(!target) return;

        let resource = Object.keys(creep.carry)[1];
        if(creep.pos.isNearTo(target)) {
            creep.transfer(target, resource);
            creep.memory.state = "pickAtStorage";
            this.pickAtStorage(creep, reactor);
        } else {
            creep.moveTo(target);
        }
    },
    pickAtStorage: function(creep, reactor) {
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
            if(missingInput > 0) {
                missingInput = Math.max(5, missingInput);
                let inStore = creep.room.storage.store[resource.type] || 0;
                creep.withdraw(creep.room.storage, resource.type, Math.min(creep.carryCapacity, missingInput, inStore));
            }
        }

        creep.memory.state = "deliver";
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'scientist');
