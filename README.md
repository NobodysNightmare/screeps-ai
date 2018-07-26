# NobodysNightmare's Screeps AI

This is my personal AI for the computer game [Screeps](https://screeps.com).

## Manual control

### Constructions

Multiple structures and structure groups can be pre-planned.
The general rule is to place a flag called `buildName`, to plan a structure called
`Name` (see below for valid values) at the specified position.
Using a flag called `removeName` you can remove the named structure at that position.

Depending on the structure, only a limited amount might be planned or the flag color might
have a meaning.

#### Extension Clusters

* **Building name:** `extensionCluster`
* **color:** no significance

Marks an area where multiple extensions will be built. The outline exactly fits the
roads that will be placed around the extensions.

#### Towers

* **Building name:** `tower`
* **color:** no significance

Plans a tower at the specified location.

#### Storage

* **Building name:** `storage`
* **color:** Determines direction of attached link. Starting top, clockwise.
  Only the first 4 colors are valid.

Marks the spot where the storage of the room shall be built. The outlines arrow indicates
at which location the associated link of the storage will be placed.

Note: Since only one storage can be placed, placing additional storages will clear the old
storage location.

#### Terminal

* **Building name:** `terminal`
* **color:** no significance

Plans a terminal at the specified location.

#### Reactor

* **Building name:** `reactor`
* **color:** Determines direction of entrance into reactor. Starting top left, clockwise.
  Only the first 4 colors are valid.

Around that spot labs will be built that will then process minerals to
compounds.

#### Booster

* **Building name:** `booster`
* **color:** no effect

Build a lab that will be used to boost creeps.

#### Walls

* **Building name:** `walls`
* **color:** "Odd" colors (e.g. red) will place the top-right corner, "even" colors the lower left corner.

All tiles on the wall rectangle and outside will be considered to belong to the outside wall,
while all tiles inside this area will belong to the inner perimeter.

While this will not yet automatically build any walls, masons will respect this outline and only
reinforce outside walls and ramparts and none in the inner perimeter.

### Spawning Creeps

There are multiple creep spawning operations available. They are all controlled using the same scheme.
The room that should spawn creeps receives a flag called `spawnNameX`, where `Name` is the name of the
operation (see below) and `X` is the operation identifier (e.g. `1`). The room targeted by the operation receives
a flag called `nameX`, where `name` and `X` again refer to the name and identifier of the operation.

Depending on the operation, the color of the spawn flag might indicate the strength of the operation
(see below). Having different operation identifiers allows to run multiple operations of the same type
simultaneously.

#### Draining hostile rooms

* **Operation name:** `drain`
* **color:** Controls number of hopper/healer pairs being spawned

Spawns some creeps that drain a hostile room by attracting the towers
fire.

#### Attacking hostile rooms

* **Operation name:** `attack`
* **color:** Controls number of attackers being spawned
* **secondary color:** Also spawn a healer per attacker if color greater than 1 (Red) is chosen.

Spawns some creeps that attack a hostile room.

#### Stealing resources

* **Operation name:** `scoop`
* **color:** Controls number of scoopers being spawned

Spawns creeps to scoop resources from a room.
They will pickup resources on the ground and in containers.

#### Attacking a controller

* **Operation name:** `downgrade`
* **color:** No effect

Spawns a creep to attack a controller.

#### Farming Power Banks

* **Operation name:** `power`
* **color:** Controls number of simultaneous farmers.

Will spawn all creeps neccessary to farm the power bank in a given room.

#### Claiming a room

* **Operation name:** `claim`
* **color:** meaningless

Spawns a claimer followed by conquerors to build up the first spawn. The spawn will be built
at the location of the claim flag in the target room.

After the spawn was built, the source room will continue to support the target room by sending
fully upgraded miners into it, until the target room can take care of that by itself.

### Misc

#### Supporting other players with excess resources

Using `Memory.resourceSupport` foreign rooms can be setup for support with overflowing resources:

````json
{
    "resourceSupport": {
        "energy": ["W0S0", "W1S1"],
        "X": ["W0S0"]
    }
}
````

Multiple rooms in a resource array will be supported round robin.

## TODOs

* Use links to collect energy from remote mines at room border
* Better defense mechanics
    * spawn defenders in response to attackers force (no over-delivering)
    * towers should attack target picked by defense aspect
    * defense aspect should actually "think" about which target to pick
* Automatically start claiming as soon as room is ready (e.g. if it is currently claimed by another player)
* Flag-based interaction
    * Manual operation for supply transports
* Use observers to obtain vision on a room
* Improve own pathfinder
    * Plan routes depending on known facts about rooms
    * automatically collect known facts about rooms
* Automated base-building?
