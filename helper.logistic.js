var storeStructures = [
    STRUCTURE_CONTAINER,
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_TERMINAL
];

module.exports = {
    obtainResults: {
        withdrawn: 1,
        harvested: 2,
        moving: 3,
        pickedUp: 4
    },
    obtainEnergy: function(creep, source, considerStorage) {
        this.pickupSpareEnergy(creep);

        if(considerStorage) {
            var result = this.obtainEnergyFromStore(creep, creep.room.storage);
            if(result) {
                return result;
            }
        }

        if(!source) return null;

        var store = this.storeFor(source);
        var result = this.obtainEnergyFromStore(creep, store);
        if(result) {
            return result;
        } else {
            result = creep.harvest(source);
            if(result == OK) {
                return this.obtainResults.harvested;
            } else if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
                return this.obtainResults.moving;
            }
        }
        return null; // something unexpected happened
    },
    obtainEnergyFromStore: function(creep, store) {
        if(store && (store.energy > 0 || (store.store && store.store.energy > 0))) {
            var result = creep.withdraw(store, RESOURCE_ENERGY);
            if(result == OK) {
                return this.obtainResults.withdrawn;
            } else if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(store);
                return this.obtainResults.moving;
            }
        }

        return null;
    },
    pickupSpareEnergy: function(creep) {
        var resources = creep.pos.lookFor(LOOK_ENERGY);
        // TODO: fix to work with any resource (and not pickup resource even if we want energy)
        if(resources.length > 0 && resources[0].resourceType == RESOURCE_ENERGY) {
            creep.pickup(resources[0]);
        }
    },
    storeFor: function(target, includeConstructions, structureType) {
        if(target && storeStructures.includes(target.structureType) && (!structureType || structureType == target.structureType)) return target;

        if(!includeConstructions && !structureType) {
            var stores = target.room.memory.stores;
            if(stores) {
                var store = Game.getObjectById(stores[target.id]);
                if(store) return store;
            }
        }

        var structures = target.pos.findInRange(FIND_STRUCTURES, 2);
        var store = _.find(structures, (r) => storeStructures.includes(r.structureType) && (!structureType || structureType == r.structureType));
        if(store) {
            target.room.memory.stores = target.room.memory.stores || {};
            target.room.memory.stores[target.id] = store.id;
            return store;
        }

        if(includeConstructions) {
            var constructions = target.pos.findInRange(FIND_CONSTRUCTION_SITES, 2);
            return _.find(constructions, (r) => storeStructures.includes(r.structureType) && (!structureType || structureType == r.structureType));
        } else {
            return null;
        }
    },
    distanceByPath: function(source, destination) {
        if(Memory.distances && Memory.distances[source.id] && Memory.distances[source.id][destination.id]) {
            return Memory.distances[source.id][destination.id];
        }

        // TODO: consider some kinds of obstacles?
        var pathResult = PathFinder.search(source.pos, [{ pos: destination.pos, range: 1 }]);
        var path = pathResult.path;
        Memory.distances = Memory.distances || {};
        Memory.distances[source.id] = Memory.distances[source.id] || {};
        Memory.distances[source.id][destination.id] = path.length;
        return path.length;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'logistics');
