const INPUT_BUFFER = 1000;

const BASE_RESOURCES = ["energy", "H", "O", "U", "L", "K", "Z", "X", "G"];

function allComponents(product) {
    let result = [];
    for(let component of Object.keys(COMMODITIES[product].components)) {
        result.push(component);
        if(!BASE_RESOURCES.includes(component) && COMMODITIES[component]) {
            result = result.concat(allComponents(component));
        }
    }

    return _.uniq(result);
}

module.exports = class Factory {
    constructor(room) {
        if(!room.memory.factory) {
            room.memory.factory = {
                product: null
            };
        }

        this.room = room;
        this.memory = room.memory.factory;
        this.structure = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_FACTORY })[0];
    }

    set product(product) {
        this.memory.product = product;
        this.updateUsableResources();
    }

    get product() {
        return this.memory.product;
    }

    get usableResources() {
        if(!this.memory.usableResources) this.updateUsableResources();

        return this.memory.usableResources;
    }

    isAvailable() {
        return !!this.structure;
    }

    nextProduction(product) {
        if(!product) product = this.product;
        if(!product) return null;

        let receipe = COMMODITIES[product];
        if(!receipe) return null;
        let missingComponents = _.filter(Object.keys(receipe.components), (r) => this.structure.store[r] < receipe.components[r]);

        // TODO:
        // * produce level-free components, if level-requiring product is not possible due to not being operated
        // * do not produce level-free components that are only components of items not producible locally

        if(missingComponents.length == 0 && (!receipe.level || receipe.level == this.structure.level)) {
            return product;
        } else {
            for(let component of missingComponents) {
                if(!BASE_RESOURCES.includes(component) && COMMODITIES[component]) {
                    let result = this.nextProduction(component);
                    if(result) return result;
                }
            }
        }
    }

    importableResources() {
        if(!this.product) return [];

        return _.filter(this.usableResources, (r) => this.structure.store[r] < INPUT_BUFFER);
    }

    exportableResources() {
        if(!this.product) return Object.keys(this.structure.store);

        let neededResources = this.usableResources;
        return _.filter(Object.keys(this.structure.store), (r) => !neededResources.includes(r));
    }

    updateUsableResources() {
        if(!this.product) {
            this.memory.usableResources = [];
            return;
        }

        this.memory.usableResources = allComponents(this.product);
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'Factory');
