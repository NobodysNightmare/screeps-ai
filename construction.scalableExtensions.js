const layout = require("helper.layout");

// oo-oo
// o-o-o
// -ooo-
// o-o-o
// oo-oo

const centerRow = [
    STRUCTURE_EXTENSION,
    STRUCTURE_EXTENSION,
    STRUCTURE_EXTENSION,
    STRUCTURE_ROAD
];

const cornerRow = [
    STRUCTURE_EXTENSION,
    STRUCTURE_ROAD
];

const rowSchemes = [
    { rowDefinition: centerRow, offset: 1 },
    { rowDefinition: cornerRow, offset: 0 },
    { rowDefinition: centerRow, offset: 3 },
    { rowDefinition: cornerRow, offset: 0 }
];

const minSize = 4;

// adding the number of spawns to the total, since we know that spawns "steal" three spots
const neededExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][8] + CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][8];

function eachClusterStructure(cluster, callback) {
    let schemes = Array.from(rowSchemes);
    for(let dy = 0; dy < cluster.height; dy++) {
        let row = schemes.shift();
        schemes.push(row);

        for(let dx = 0; dx < cluster.width; dx++) {
            callback(cluster.x + dx, cluster.y + dy, row.rowDefinition[(dx + row.offset) % row.rowDefinition.length]);
        }
    }
}

function clusterSize(cluster) {
    let size = 0;
    eachClusterStructure(cluster, (x, y, structureType) => {
        if(structureType === STRUCTURE_EXTENSION) size++;
    });

    return size;
}

function shrinkCluster(cluster, targetSize) {
    let lastCluster = cluster;
    while(clusterSize(cluster) > targetSize) {
        lastCluster = cluster;
        if(cluster.width > cluster.height) {
            cluster = { ...cluster, width: cluster.width - 1 };
        } else {
            cluster = { ...cluster, height: cluster.height - 1 };
        }

        if(cluster.height < minSize || cluster.width < minSize) break;
    }

    return lastCluster;
}

module.exports = {
    type: "scalableExtensions",
    outline: function(room, cluster) {
        room.visual.rect(cluster.x - 0.5, cluster.y - 0.5, cluster.width, cluster.height, { stroke: "#77f", fill: null });
    },
    build: function(proxy, cluster) {
        eachClusterStructure(cluster, (x, y, structureType) => proxy.planConstruction(x, y, structureType));
    },
    updateCostMatrix: function(matrix, cluster) {
        eachClusterStructure(cluster, (x, y, structureType) => {
            if(structureType === STRUCTURE_EXTENSION) matrix.set(x, y, 255);
        });
    },
    addBuilding: function(memory, flag) {
        memory.push({ x: flag.pos.x, y: flag.pos.y, width: 4 + flag.color, height: 4 + flag.secondaryColor });
    },
    removeBuilding: function(memory, flag) {
        let index = _.findIndex(memory, (p) => p.x == flag.pos.x && p.y == flag.pos.y);
        if(index >= 0) memory.splice(index, 1);
    },
    plan: function(spaceFinder, buildings, room) {
        let missingExtensions = neededExtensions - _.sum(buildings, (b) => (b.type === this.type) ? clusterSize(b.memory) : 0);
        if(missingExtensions <= 0) return [];

        let spaces = spaceFinder.findSpaces(minSize, minSize);
        let preferredPos = layout.averagePos(_.map(room.find(FIND_SOURCES), (s) => s.pos).concat([room.controller.pos]));
        spaces = _.sortBy(spaces, (s) => layout.distanceFromSpace(preferredPos, s));

        let plannedClusters = [];
        for(let space of spaces) {
            let cluster = { x: space.x, y: space.y, width: space.width, height: space.height };
            cluster = shrinkCluster(cluster, missingExtensions);
            cluster = { ...cluster, ...layout.alignInSpace(preferredPos, space, { width: cluster.width, height: cluster.height }) };

            plannedClusters.push(cluster);

            missingExtensions -= clusterSize(cluster);
            if(missingExtensions <= 0) return plannedClusters;
        }

        return plannedClusters;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'construction.extensionCluster');
