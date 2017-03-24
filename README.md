# NobodysNightmare's Screeps AI

This is my personal AI for the computer game [Screeps](https://screeps.com).

## Manual control

### Constructions

Place a flag called **extensionCluster** inside a claimed room.
This will mark a permanent area for extensions.

A **clear** flag on the same spot will remove that area again.

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

Spawns some creeps that attack a hostile room.

#### Claiming a room

* **Operation name:** `claim`
* **color:** meaningless

Spawns a claimer followed by conquerors to build up the first spawn. The spawn will be built
at the location of the claim flag in the target room.

After the spawn was built, the source room will continue to support the target room by sending
fully upgraded miners into it, until the target room can take care of that by itself.

## TODOs

* Use links to collect energy from remote mines at room border
* Better defense mechanics
    * spawn defenders in response to attackers force (no over-delivering)
    * towers should attack target picked by defense aspect
    * defense aspect should actually "think" about which target to pick
    * while defending a reloader should keep towers supplied with energy
    * Better rampart/wall mechanics
        * allow higher repair levels
        * probably different levels for ramparts depending on purpose (e.g. more on Spawner?)
    * Nuke notifications?
* Automatically start claiming as soon as room is ready (e.g. if it is currently claimed by another player)
* Flag-based interaction
    * Set tower locations
    * Set Storage+Link Location
* Minerals
    * keep a reserve in storage, only sell excess
    * Process them in Labs
    * Boost creeps
* Supply nukes with Ghodium
* Use observers to obtain vision on a room
* Automated base-building?
