import { Difficulty } from './Difficulty';
import { WallType, Wall } from './Wall';
import { Board } from './Board';

export class WallGenerator {
    static generate(board: Board, difficulty: Difficulty) {
        let valid = false;
        let attempts = 0;
        const maxAttempts = 10000;

        let magicDoorCount = 1;
        if (difficulty === Difficulty.MEDIUM) magicDoorCount = 2;
        if (difficulty === Difficulty.HARD) magicDoorCount = 3;

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

            let doorEdges: { r1: number, c1: number, r2: number, c2: number }[] = [];
            let componentA = new Set<number>(); // Rabbits

            for (let i = 0; i < stEdges.length; i++) {
                const testEdges = [...stEdges];
                testEdges.splice(i, 1);
                const comp = this.getComponent(testEdges, 0); // Start at Rabbit1 (0)

                // Check if this component has Rabbits (0,12) and NO Mice (3,15)
                // Ideally, we want Separation: Rabbits in A, Mice in B.
                // So Component A has Rabbits but NO Mice.

                const hasRabbits = comp.has(0) && comp.has(12);
                const compHasMice = comp.has(3) || comp.has(15);

                if (hasRabbits && !compHasMice) {
                    doorEdges.push(stEdges[i]); // Primary cut
                    componentA = comp;
                    break;
                }
            }

            if (doorEdges.length === 0) continue; // Retry

            // 2. Identify Boundary Edges
            // All edges (tree or not) that cross from A to B
            const boundaryEdges = [];
            for (const edge of edges) {
                if (edge === doorEdges[0]) continue;
                const u = edge.r1 * 4 + edge.c1;
                const v = edge.r2 * 4 + edge.c2;
                if (componentA.has(u) !== componentA.has(v)) {
                    boundaryEdges.push(edge);
                }
            }

            // 3. Assign Types
            // Base counts for Easy: W:2, R:4, M:4, F:13, D:1
            // Adjust based on magicDoorCount: 
            // Medium (2): W:2, R:4, M:4, F:12, D:2
            // Hard (3): W:2, R:4, M:4, F:11, D:3
            let counts = { W: 2, R: 4, M: 4, F: 14 - magicDoorCount, D: magicDoorCount };
            const assignments = new Map();

            assignments.set(doorEdges[0], 'D');
            counts.D--;

            // Retry if we don't have enough boundary edges for extra doors.
            if (boundaryEdges.length < counts.D) continue;

            // Add extra magic doors from boundary edges
            this.shuffle(boundaryEdges);
            for (; counts.D > 0; counts.D--) {
                const extraDoor = boundaryEdges.shift();
                if (extraDoor) {
                    assignments.set(extraDoor, 'D');
                    doorEdges.push(extraDoor);
                }
            }

            // Fill Boundary with Blocking Walls (W, M for Rabbits, R for Mice)
            for (const e of boundaryEdges) {
                if (counts.W > 0) {
                    assignments.set(e, 'W');
                    counts.W--;
                }
            }

            // Assign remaining
            const unassigned = edges.filter(e => !assignments.has(e));

            // Sort: Tree edges first (connectivity critical)
            unassigned.sort((a, b) => {
                const aTree = stEdges.includes(a);
                const bTree = stEdges.includes(b);
                return (bTree ? 1 : 0) - (aTree ? 1 : 0);
            });

            for (const e of unassigned) {
                if (boundaryEdges.includes(e)) {
                    if (counts.M > 0 && counts.R > 0) {
                        const coin = Math.random();
                        if (coin < 0.5) {
                            assignments.set(e, 'M');
                            counts.M--;
                        } else {
                            assignments.set(e, 'R');
                            counts.R--;
                        }
                    } else if (counts.M > 0) { assignments.set(e, 'M'); counts.M--; }
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
                board.magicDoors = [];
                for (const [edge, type] of assignments) {
                    const wall = board.getWallBetween(edge.r1, edge.c1, edge.r2, edge.c2)!;
                    this.applyTypeToWall(wall, type);
                    if (wall.type === WallType.MAGIC_DOOR) {
                        board.magicDoors.push(wall);
                    }
                }
                valid = true;
                console.log(`Generated valid board in ${attempts} attempts with ${magicDoorCount} magic doors.`);
            }
        }

        if (!valid) console.error("Could not generate valid board.");
    }

    static resetWalls(board: Board) {
        for (const row of board.horizontalWalls) {
            for (const wall of row) {
                if (!wall.isExternal) wall.type = WallType.WALL;
            }
        }
        for (const row of board.verticalWalls) {
            for (const wall of row) {
                if (!wall.isExternal) wall.type = WallType.WALL;
            }
        }
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

    static shuffle(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    static buildSpanningTree(edges: any[]) {
        const tree = [];
        const parent = new Array(16).fill(0).map((_, i) => i);
        const find = (i: number): number => {
            if (parent[i] === i) return i;
            parent[i] = find(parent[i]);
            return parent[i];
        };
        const union = (i: number, j: number) => {
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

    static getComponent(treeEdges: { r1: number, c1: number, r2: number, c2: number }[], startNode: number): Set<number> {
        const adj: number[][] = Array.from({ length: 16 }, () => []);
        for (const e of treeEdges) {
            const u = e.r1 * 4 + e.c1;
            const v = e.r2 * 4 + e.c2;
            adj[u].push(v);
            adj[v].push(u);
        }

        const visited = new Set<number>();
        const q = [startNode];
        visited.add(startNode);
        while (q.length) {
            const curr = q.shift();
            if (curr !== undefined && adj[curr]) {
                for (const n of adj[curr]) {
                    if (!visited.has(n)) {
                        visited.add(n);
                        q.push(n);
                    }
                }
            }
        }
        return visited;
    }

    static checkConnectivity(assignments: Map<any, string>, species: string) {
        const adj: number[][] = Array.from({ length: 16 }, () => []);
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
            if (curr !== undefined) {
                for (const n of adj[curr]) {
                    if (!visited.has(n)) {
                        visited.add(n);
                        q.push(n);
                    }
                }
            }
        }
        return visited.size === 16;
    }

    static applyTypeToWall(wall: Wall, type: string) {
        switch (type) {
            case 'W': wall.type = WallType.WALL; break;
            case 'R': wall.type = WallType.RABBIT_WINDOW; break;
            case 'M': wall.type = WallType.MOUSE_HOLE; break;
            case 'F': wall.type = WallType.FREE_PASSAGE; break;
            case 'D': wall.type = WallType.MAGIC_DOOR; wall.isOpen = false; break;
        }
    }

    static getWallChar(wall: Wall, isHorizontal: boolean) {
        let char = ' ';
        switch (wall.type) {
            case WallType.WALL: char = 'W'; break;
            case WallType.RABBIT_WINDOW: char = 'R'; break;
            case WallType.MOUSE_HOLE: char = 'M'; break;
            case WallType.MAGIC_DOOR: char = 'D'; break;
            case WallType.FREE_PASSAGE: char = 'F'; break;
        }

        if (isHorizontal) {
            return `- ${char} -`;
        } else {
            return char;
        }
    }
}
