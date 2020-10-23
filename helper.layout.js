module.exports = {
    averagePos: function(positions) {
        positions = _.compact(positions);
        if(positions.length === 0) return null;

        return {
            x: Math.round(_.sum(_.map(positions, (p) => p.x)) / positions.length),
            y: Math.round(_.sum(_.map(positions, (p) => p.y)) / positions.length)
        };
    },

    centerPos: function(rect) {
        return {
            x: Math.round(rect.x + rect.width / 2),
            y: Math.round(rect.y + rect.height / 2)
        };
    },

    distanceFromSpace: function(pos, space) {
        let h = 0;
        let v = 0;

        if(pos.x < space.x) {
            h = space.x - pos.x;
        } else if(pos.x > space.x + space.width - 1) {
            h = pos.x - (space.x + space.width - 1);
        }

        if(pos.y < space.y) {
            v = space.y - pos.y;
        } else if(pos.y > space.y + space.height - 1) {
            v = pos.y - (space.y + space.height - 1);
        }

        return Math.max(h, v);
    },

    //returns position that will put the center of the building to the closest
    // possible point towards targetPos, while keeping the whole building within
    // the rect defined by space.
    // building spec defines the height and width of a building, as well as the
    // x and y coordinates within that rect that define the placement position
    // (in case buildings are not placed using a top-left position)
    alignInSpace: function(targetPos, space, buildingSpec) {
        buildingSpec = { x: 0, y: 0, width: 1, height: 1, ...buildingSpec };
        let idealCenterX = Math.max(Math.min(targetPos.x, space.x + space.width - (buildingSpec.width / 2)), space.x + buildingSpec.width / 2);
        let idealCenterY = Math.max(Math.min(targetPos.y, space.y + space.height - (buildingSpec.height / 2)), space.y + buildingSpec.height / 2);

        return {
            x: Math.ceil(idealCenterX + (buildingSpec.x - buildingSpec.width / 2)),
            y: Math.ceil(idealCenterY + (buildingSpec.y - buildingSpec.height / 2)),
        };
    }
};
