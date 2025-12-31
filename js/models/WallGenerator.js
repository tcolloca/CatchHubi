class WallGenerator {
    static generate(board) {
        let valid = false;
        let attempts = 0;
        const maxAttempts = 10000;

        while (!valid && attempts < maxAttempts) {
            attempts++;
            this.resetWalls(board);
            const edges = this.getAllInternalEdges();
            this.shuffle(edges);

            // 1. Find Cut/Door Edge
            // Separate Rabbits (Left: 0, 12) from Mice (Right: 3, 15)
            // Indices: 0, 12 are Left (Col 0). 3, 15 are Right (Col 3).
            // Indices:
            // 0 1 2 3
            // 4 5 6 7
            // 8 9 10 11
            // 12 13 14 15

            // Heuristic for cut:
            // Build a random spanning tree, find an edge that splits Left from Right.
            const stEdges = this.buildSpanningTree(edges);

            let doorEdge = null;
            let componentA = new Set(); // Rabbits

            for (let i = 0; i < stEdges.length; i++) {
                const testEdges = [...stEdges];
                testEdges.splice(i, 1);
                const comp = this.getComponent(testEdges, 0); // Start at Rabbit1 (0)

                // Check if this component has Rabbits (0,12) and NO Mice (3,15)
                // OR has Mice (3,15) and NO Rabbits (0,12) -> Wait, simpler:
                // If we split the tree, we have A and B. 
                // We want A to have Rabbits and B to have Mice (or vice versa).

                const hasRabbits = comp.has(0) && comp.has(12);
                const hasMice = comp.has(3) && comp.has(15);

                // Ideally, we want Separation: Rabbits in A, Mice in B.
                // So Component A has Rabbits but NO Mice.
                // Or Component A has Mice but NO Rabbits.

                const compHasMice = comp.has(3) || comp.has(15);
                const compHasRabbits = comp.has(0) || comp.has(12);

                if (hasRabbits && !compHasMice) {
                    doorEdge = stEdges[i]; // Found cut
                    componentA = comp;
                    break;
                } else if (hasMice && !compHasRabbits) {
                    doorEdge = stEdges[i]; // Found cut (Mice are in A)
                    componentA = comp;
                    break;
                }
            }

            if (!doorEdge) continue; // Retry

            // 2. Identify Boundary Edges
            // All edges (tree or not) that cross from A to B
            const boundaryEdges = [];
            for (const edge of edges) {
                if (edge === doorEdge) continue;
                const u = edge.r1 * 4 + edge.c1;
                const v = edge.r2 * 4 + edge.c2;
                if (componentA.has(u) !== componentA.has(v)) {
                    boundaryEdges.push(edge);
                }
            }

            // 3. Assign Types
            // Counts: W:2, R:4, M:4, F:13, D:1
            let counts = { W: 2, R: 4, M: 4, F: 13, D: 1 };
            const assignments = new Map();

            assignments.set(doorEdge, 'D');
            counts.D--;

            // Fill Boundary with Blocking Walls (W, M for Rabbits, R for Mice)
            // We want to block passage across boundary.
            // If u in Rabbits(A) -> R wall allows flow? No R wall blocks Mice.
            // Wait.
            // R wall: Rabbits can cross. Mice blocked.
            // M wall: Mice can cross. Rabbits blocked.
            // W wall: Nobody crosses.

            // To separate:
            // We want NOBODY to cross (ideally).
            // But we only have 2 Ws.
            // So we must use R or M.
            // If we use R: Rabbits can cross the boundary (Leak!). Mice blocked.
            // If we use M: Mice can cross the boundary (Leak!). Rabbits blocked.

            // So we can strictly separate ONE species, but not the other (unless we use W).
            // Or we alternate?

            this.shuffle(boundaryEdges);
            for (const e of boundaryEdges) {
                if (counts.W > 0) {
                    assignments.set(e, 'W');
                    counts.W--;
                }
                // We leave others unassigned for now, to be filled by global fill or specific logic?
                // Let's try filling them with separation logic if possible.
                else {
                    // Try to use M or R to block at least one side?
                    // But we also need to satisfy connectivity constraints.
                    // Let's leave them for the global fill which we'll bias.
                }
            }

            // Assign remaining
            const unassigned = edges.filter(e => !assignments.has(e));

            // Sort: Tree edges first (connectivity critical)
            unassigned.sort((a, b) => {
                const aTree = stEdges.includes(a);
                const bTree = stEdges.includes(b);
                return bTree - aTree;
            });

            for (const e of unassigned) {
                // Heuristic:
                // If Boundary Edge (and not W):
                //   Using R blocks Mice. Using M blocks Rabbits. Using F blocks nothing.
                //   We prefer blocking.
                if (boundaryEdges.includes(e)) {
                    if (counts.M > 0) { assignments.set(e, 'M'); counts.M--; }
                    else if (counts.R > 0) { assignments.set(e, 'R'); counts.R--; }
                    else if (counts.F > 0) { assignments.set(e, 'F'); counts.F--; }
                } else {
                    // Internal Edge
                    // Prefer F for tree edges to ensure flow.
                    if (stEdges.includes(e)) {
                        if (counts.F > 0) { assignments.set(e, 'F'); counts.F--; }
                        else if (counts.R > 0) { assignments.set(e, 'R'); counts.R--; } // Risky if on Mouse side
                        else if (counts.M > 0) { assignments.set(e, 'M'); counts.M--; } // Risky if on Rabbit side
                        else if (counts.W > 0) { assignments.set(e, 'W'); counts.W--; } // Very risky
                    } else {
                        // Non-Tree Internal
                        if (counts.W > 0) { assignments.set(e, 'W'); counts.W--; }
                        else if (counts.M > 0) { assignments.set(e, 'M'); counts.M--; }
                        else if (counts.R > 0) { assignments.set(e, 'R'); counts.R--; }
                        else if (counts.F > 0) { assignments.set(e, 'F'); counts.F--; }
                    }
                }
            }

            // 4. Connectivity Check
            // D counts as Open.
            if (this.checkConnectivity(assignments, 'rabbit') &&
                this.checkConnectivity(assignments, 'mouse')) {
                // Apply
                for (const [edge, type] of assignments) {
                    const wall = board.getWallBetween(edge.r1, edge.c1, edge.r2, edge.c2);
                    this.applyTypeToWall(wall, type);
                    if (wall.type === WallType.MAGIC_DOOR) {
                        board.magicDoors.push(wall);
                    }
                }
                valid = true;
                console.log(`Generated valid board in ${attempts} attempts.`);
            }
        }

        if (!valid) console.error("Could not generate valid board.");
    }

    static buildSpanningTree(edges) {
        const tree = [];
        const parent = new Array(16).fill(0).map((_, i) => i);
        const find = (i) => {
            if (parent[i] === i) return i;
            parent[i] = find(parent[i]);
            return parent[i];
        };
        const union = (i, j) => {
            const rootI = find(i);
            const rootJ = find(j);
            if (rootI !== rootJ) {
                parent[rootI] = rootJ;
                return true;
            }
            return false;
        };
        for (const e of edges) {
            const u = e.r1 * 4 + e.c1;
            const v = e.r2 * 4 + e.c2;
            if (union(u, v)) tree.push(e);
        }
        return tree;
    }

    static getComponent(treeEdges, startNode) {
        const adj = Array.from({ length: 16 }, () => []);
        for (const e of treeEdges) {
            const u = e.r1 * 4 + e.c1;
            const v = e.r2 * 4 + e.c2;
            adj[u].push(v);
            adj[v].push(u);
        }

        const visited = new Set();
        const q = [startNode];
        visited.add(startNode);
        while (q.length) {
            const curr = q.shift();
            for (const n of adj[curr]) {
                if (!visited.has(n)) {
                    visited.add(n);
                    q.push(n);
                }
            }
        }
        return visited;
    }

    static checkConnectivity(assignments, species) {
        const adj = Array.from({ length: 16 }, () => []);
        for (const [edge, type] of assignments) {
            let passable = false;
            if (type === 'F') passable = true;
            if (type === 'D') passable = true; // Treating Door as Open for connectivity
            if (species === 'rabbit' && type === 'R') passable = true;
            if (species === 'mouse' && type === 'M') passable = true;

            if (passable) {
                const u = edge.r1 * 4 + edge.c1;
                const v = edge.r2 * 4 + edge.c2;
                adj[u].push(v);
                adj[v].push(u);
            }
        }

        const visited = new Set();
        const q = [0]; // Check from Rabbit1 (0)
        visited.add(0);
        while (q.length) {
            const curr = q.shift();
            for (const n of adj[curr]) {
                if (!visited.has(n)) {
                    visited.add(n);
                    q.push(n);
                }
            }
        }
        return visited.size === 16;
    }

    static applyTypeToWall(wall, type) {
        switch (type) {
            case 'W': wall.type = WallType.WALL; break;
            case 'R': wall.type = WallType.RABBIT_WINDOW; break;
            case 'M': wall.type = WallType.MOUSE_HOLE; break;
            case 'F': wall.type = WallType.FREE_PASSAGE; break;
            case 'D': wall.type = WallType.MAGIC_DOOR; wall.isOpen = false; break;
        }
    }

    static resetWalls(board) {
        // for (let r = 0; r < 9; r++) {
        //     for (let c = 0; c < 9; c++) {
        //         const cell = board.grid[r][c];
        //         if (cell && cell.constructor.name === 'Wall' && !cell.isExternal) {
        //             cell.type = WallType.Wall;
        //         }
        //     }
        // }
    }

    static getAllInternalEdges() {
        const edges = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 3; c++) {
                edges.push({ r1: r, c1: c, r2: r, c2: c + 1 });
            }
        }
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 4; c++) {
                edges.push({ r1: r, c1: c, r2: r + 1, c2: c });
            }
        }
        return edges;
    }

    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    static generateASCII(board) {
        let output = "";
        // Grid is 9x9 (0..8)
        for (let r = 0; r < 9; r++) {
            let line = "";
            for (let c = 0; c < 9; c++) {
                const cell = board.grid[r][c];

                if (r % 2 === 0 && c % 2 === 0) {
                    // Corner
                    line += "+";
                } else if (r % 2 === 0) {
                    // Horizontal Wall
                    if (cell.isExternal) {
                        line += "---"; // W
                    } else {
                        line += this.getWallChar(cell, true);
                    }
                } else if (c % 2 === 0) {
                    // Vertical Wall
                    if (cell.isExternal) {
                        line += "|"; // W
                    } else {
                        line += this.getWallChar(cell, false);
                    }
                } else {
                    // Tile
                    line += "   "; // White space
                }
            }
            output += line + "\n";
        }
        return output;
    }

    static getWallChar(wall, isHorizontal) {
        let char = ' ';
        switch (wall.type) {
            case WallType.WALL: char = 'W'; break;
            case WallType.RABBIT_WINDOW: char = 'R'; break;
            case WallType.MOUSE_HOLE: char = 'M'; break;
            case WallType.MAGIC_DOOR: char = 'D'; break;
            case WallType.FREE_PASSAGE: char = 'F'; break;
        }

        if (isHorizontal) {
            return `-${char}-`;
        } else {
            return char;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WallGenerator;
}
