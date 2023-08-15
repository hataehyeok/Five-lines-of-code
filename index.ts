
const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

interface RawTileValue {
  transform(): Tile;
}
class AirValue implements RawTileValue {
  transform(): Tile {
    return new Air();
  }
}
class FluxValue implements RawTileValue {
  transform(): Tile {
    return new Flux();
  }
}
class UnbreakableValue implements RawTileValue {
  transform(): Tile {
    return new Unbreakable();
  }
}
class PlayerValue implements RawTileValue {
  transform(): Tile {
    return new PlayerTile();
  }
}
class StoneValue implements RawTileValue {
  transform(): Tile {
    return new Stone(new Resting());
  }
}
class FallingStoneValue implements RawTileValue {
  transform(): Tile {
    return new Stone(new Falling());
  }
}
class BoxValue implements RawTileValue {
  transform(): Tile {
    return new Box(new Resting());
  }
}
class FallingBoxValue implements RawTileValue {
  transform(): Tile {
    return new Box(new Falling());
  }
}
class Key1Value implements RawTileValue {
  transform(): Tile {
    return new Key(YELLOW_KEY);
  }
}
class Lock1Value implements RawTileValue {
  transform(): Tile {
    return new LockTile(YELLOW_KEY);
  }
}
class Key2Value implements RawTileValue {
  transform(): Tile {
    return new Key(BLUE_KEY);
  }
}
class Lock2Value implements RawTileValue {
  transform(): Tile {
    return new LockTile(BLUE_KEY);
  }
}

class RawTile {
  static readonly AIR = new RawTile(new AirValue());
  static readonly FLUX = new RawTile(new FluxValue());
  static readonly UNBREAKABLE = new RawTile(new UnbreakableValue());
  static readonly PLAYER = new RawTile(new PlayerValue());
  static readonly STONE = new RawTile(new StoneValue());
  static readonly FALLING_STONE = new RawTile(new FallingStoneValue());
  static readonly BOX = new RawTile(new BoxValue());
  static readonly FALLING_BOX = new RawTile(new FallingBoxValue());
  static readonly KEY1 = new RawTile(new Key1Value());
  static readonly LOCK1 = new RawTile(new Lock1Value());
  static readonly KEY2 = new RawTile(new Key2Value());
  static readonly LOCK2 = new RawTile(new Lock2Value());

  private constructor(private value: RawTileValue) { }
  transform() {
    return this.value.transform();
  }
}

const RAW_TILES = [
  RawTile.AIR,
  RawTile.FLUX,
  RawTile.UNBREAKABLE,
  RawTile.PLAYER,
  RawTile.STONE, RawTile.FALLING_STONE,
  RawTile.BOX, RawTile.FALLING_BOX,
  RawTile.KEY1, RawTile.LOCK1,
  RawTile.KEY2, RawTile.LOCK2
];

interface FallingState {
  isFalling(): boolean;
  moveHorizontal(map: Map, player: Player, tile: Tile, dx: number): void;
  drop(tile: Tile, x: number, y: number): void;
}

class Falling implements FallingState {
  isFalling(): boolean { return true; }
  moveHorizontal(map: Map, player: Player, tile: Tile, dx: number) { }
  drop(tile: Tile, x: number, y: number): void {
    map.drop(tile, x, y);
  }
}

class Resting implements FallingState {
  isFalling(): boolean { return false; }
  moveHorizontal(map: Map, player: Player, tile: Tile, dx: number) { player.pushHorizontal(map, tile, dx); }
  drop(tile: Tile, x: number, y: number): void { }
}

class FallStrategy {
  constructor(private falling: FallingState) { }
  update(tile: Tile, x: number, y: number) {
    this.falling = map.getBlockOnTopState(x, y + 1);
    this.falling.drop(tile, x, y);
  }
  moveHorizontal(map: Map, tile: Tile, dx: number) { this.falling.moveHorizontal(map, player, tile, dx); }
}

interface RemoveStrategy {
  check(tile: Tile): boolean;
}

class RemoveLock1 implements RemoveStrategy {
  check(tile: Tile) { return tile.isLock1(); }
}

class RemoveLock2 implements RemoveStrategy {
  check(tile: Tile) { return tile.isLock2(); }
}

class KeyConfiguration {
  constructor(
    private color: string,
    private _1: boolean,
    private removeStrategy: RemoveStrategy
  ) { }
  setColor(g: CanvasRenderingContext2D) { g.fillStyle = this.color; }
  is1() { return this._1; }
  removeLock(map: Map) { map.remove(this.removeStrategy); }
  fillRect(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
}


interface Tile {
  isAir(): boolean;
  isFlux(): boolean;
  isUnbreakable(): boolean;
  isPlayer(): boolean;
  isLock1(): boolean;
  isLock2(): boolean;
  draw(g: CanvasRenderingContext2D, x: number, y: number): void;
  moveHorizontal(map: Map, player: Player, dx: number): void;
  moveVertical(map: Map, player: Player, dy: number): void;
  update(x: number, y: number): void;
  getBlockOnTopState(): FallingState;
}

class Air implements Tile {
  isAir(): boolean { return true; }
  isFlux(): boolean { return false; }
  isUnbreakable(): boolean { return false; }
  isPlayer(): boolean { return true; }
  isLock1(): boolean { return false; }
  isLock2(): boolean { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) { }
  moveHorizontal(map: Map, player: Player, dx: number) { player.move(map, dx, 0); }
  moveVertical(map: Map, player: Player, dy: number) { player.move(map, 0, dy); }
  update(x: number, y: number) { }
  getBlockOnTopState(): FallingState { return new Falling(); }
}

class Flux implements Tile {
  isAir(): boolean { return false; }
  isFlux(): boolean { return true; }
  isUnbreakable(): boolean { return false; }
  isPlayer(): boolean { return true; }
  isLock1(): boolean { return false; }
  isLock2(): boolean { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#ccffcc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number) { player.move(map, dx, 0); }
  moveVertical(map: Map, player: Player, dy: number) { player.move(map, 0, dy); }
  update(x: number, y: number) { }
  getBlockOnTopState(): FallingState { return new Resting(); }
}

class Unbreakable implements Tile {
  isAir(): boolean { return false; }
  isFlux(): boolean { return false; }
  isUnbreakable(): boolean { return true; }
  isPlayer(): boolean { return false; }
  isLock1(): boolean { return false; }
  isLock2(): boolean { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#999999";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number) { }
  moveVertical(map: Map, player: Player, dy: number) { }
  update(x: number, y: number) { }
  getBlockOnTopState(): FallingState { return new Resting(); }
}

class PlayerTile implements Tile {
  isAir(): boolean { return false; }
  isFlux(): boolean { return false; }
  isUnbreakable(): boolean { return false; }
  isPlayer(): boolean { return true; }
  isLock1(): boolean { return false; }
  isLock2(): boolean { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) { }
  moveHorizontal(map: Map, player: Player, dx: number) { }
  moveVertical(map: Map, player: Player, dy: number) { }
  update(x: number, y: number) { }
  getBlockOnTopState(): FallingState { return new Resting(); }
}

class Stone implements Tile {
  private fallStrategy: FallStrategy;
  constructor(falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }
  isAir(): boolean { return false; }
  isFlux(): boolean { return false; }
  isUnbreakable(): boolean { return false; }
  isPlayer(): boolean { return false; }
  isLock1(): boolean { return false; }
  isLock2(): boolean { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#0000cc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number) { this.fallStrategy.moveHorizontal(map, this, dx); }
  moveVertical(map: Map, player: Player, dy: number) { }
  update(x: number, y: number) { this.fallStrategy.update(this, x, y); }
  getBlockOnTopState(): FallingState { return new Resting(); }
}

class Box implements Tile {
  private fallStrategy: FallStrategy;
  constructor(falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }
  isAir(): boolean { return false; }
  isFlux(): boolean { return false; }
  isUnbreakable(): boolean { return false; }
  isPlayer(): boolean { return false; }
  isLock1(): boolean { return false; }
  isLock2(): boolean { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#8b4513";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number) { this.fallStrategy.moveHorizontal(map, this, dx); }
  moveVertical(map: Map, player: Player, dy: number) { }
  update(x: number, y: number) { this.fallStrategy.update(this, x, y); }
  getBlockOnTopState(): FallingState { return new Resting(); }
}

class Key implements Tile {
  constructor(private keyConf: KeyConfiguration) { }
  isAir(): boolean { return false; }
  isFlux(): boolean { return false; }
  isUnbreakable(): boolean { return false; }
  isPlayer(): boolean { return false; }
  isLock1(): boolean { return false; }
  isLock2(): boolean { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    this.keyConf.setColor(g);
    this.keyConf.fillRect(g, x, y);
  }
  moveHorizontal(map: Map, player: Player, dx: number) {
    this.keyConf.removeLock(map);
    player.move(map, dx, 0);
  }
  moveVertical(map: Map, player: Player, dy: number) {
    this.keyConf.removeLock(map);
    player.move(map, 0, dy);
  }
  update(x: number, y: number) { }
  getBlockOnTopState(): FallingState { return new Resting(); }
}

class LockTile implements Tile {
  constructor(private keyConf: KeyConfiguration) { }
  isAir(): boolean { return false; }
  isFlux(): boolean { return false; }
  isUnbreakable(): boolean { return false; }
  isPlayer(): boolean { return false; }
  isLock1(): boolean { return this.keyConf.is1(); }
  isLock2(): boolean { return !this.keyConf.is1(); }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    this.keyConf.setColor(g);
    this.keyConf.fillRect(g, x, y);
  }
  moveHorizontal(map: Map, player: Player, dx: number) { }
  moveVertical(map: Map, player: Player, dy: number) { }
  update(x: number, y: number) { }
  getBlockOnTopState(): FallingState { return new Resting(); }
}

const YELLOW_KEY = new KeyConfiguration("#ffcc00", true, new RemoveLock1());
const BLUE_KEY = new KeyConfiguration("#00ccff", false, new RemoveLock2());


enum RawInput {
  UP, DOWN, LEFT, RIGHT
}
interface Input {
  isRight(): boolean;
  isLeft(): boolean;
  isUp(): boolean;
  isDown(): boolean;
  handle(player: Player): void;
}

class Right implements Input {
  isRight(): boolean { return true; }
  isLeft(): boolean { return false; }
  isUp(): boolean { return false; }
  isDown(): boolean { return false; }
  handle(player: Player): void { player.moveHorizontal(1); }
}

class Left implements Input {
  isRight(): boolean { return false; }
  isLeft(): boolean { return true; }
  isUp(): boolean { return false; }
  isDown(): boolean { return false; }
  handle(player: Player): void { player.moveHorizontal(-1); }
}

class Up implements Input {
  isRight(): boolean { return false; }
  isLeft(): boolean { return false; }
  isUp(): boolean { return true; }
  isDown(): boolean { return false; }
  handle(player: Player): void { player.moveVertical(-1); }
}

class Down implements Input {
  isRight(): boolean { return false; }
  isLeft(): boolean { return false; }
  isUp(): boolean { return false; }
  isDown(): boolean { return true; }
  handle(player: Player): void { player.moveVertical(1) }
}

class Player {
  private x = 1;
  private y = 1;
  drawPlayer(g: CanvasRenderingContext2D) {
    g.fillStyle = "#ff0000";
    g.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(dx: number) {
    map.moveHorizontal(this, this.x, this.y, dx);
  }
  moveVertical(dy: number) {
    map.moveVertical(this, this.x, this.y, dy);
  }
  pushHorizontal(map: Map, tile: Tile, dx: number) {
    map.pushHorizontal(this, tile, this.x, this.y, dx);
  }
  moveToTile(map: Map, newx: number, newy: number) {
    map.movePlayer(this.x, this.y, newx, newy);
    this.x = newx;
    this.y = newy;
  }
  move(map: Map, dx: number, dy: number) {
    this.moveToTile(map, this.x + dx, this.y + dy);
  }
}

let player = new Player();


class Map {
  private map: Tile[][];
  constructor() {
    this.map = new Array(rawMap.length);
    for (let y = 0; y < rawMap.length; y++) {
      this.map[y] = new Array(rawMap[y].length);
      for (let x = 0; x < rawMap[y].length; x++) {
        this.map[y][x] = RAW_TILES[rawMap[y][x]].transform();
      }
    }
  }
  update() {
    for (let y = this.map.length - 1; y >= 0; y--) {
      for (let x = 0; x < this.map[y].length; x++) {
        this.map[y][x].update(x, y);
      }
    }
  }
  draw(g: CanvasRenderingContext2D) {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        this.map[y][x].draw(g, x, y);
      }
    }
  }
  drop(tile: Tile, x: number, y: number): void {
    this.map[y + 1][x] = tile;
    this.map[y][x] = new Air();
  }
  getBlockOnTopState(x: number, y: number): FallingState {
    return this.map[y][x].getBlockOnTopState();
  }
  movePlayer(x: number, y: number, newx: number, newy: number) {
    this.map[y][x] = new Air();
    this.map[newy][newx] = new PlayerTile();
  }
  moveHorizontal(player: Player, x: number, y: number, dx: number) {
    this.map[y][x + dx].moveHorizontal(this, player, dx);
  }
  moveVertical(player: Player, x: number, y: number, dy: number) {
    this.map[y + dy][x].moveVertical(this, player, dy);
  }
  remove(shouldRemove: RemoveStrategy) {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        if (shouldRemove.check(this.map[y][x])) {
          this.map[y][x] = new Air();
        }
      }
    }
  }
  pushHorizontal(player: Player, tile: Tile, x: number, y: number, dx: number) {
    if (this.map[y][x + dx + dx].isAir() && !this.map[y + 1][x + dx].isAir()) {
      this.map[y][x + dx + dx] = tile;
      player.moveToTile(this, x + dx, y);
    }
  }
}

let rawMap: number[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];

// 7, 5 => blue key, lock

let map = new Map();

function assertExhausted(x: never): never {
  throw new Error("Unexpected object: " + x);
}

let inputs: Input[] = [];

function remove(shouldRemove: RemoveStrategy) {
  map.remove(shouldRemove);
}

function update() {
  handleInputs();
  updateMap();
}

function handleInputs() {
  while (inputs.length > 0) {
    let input = inputs.pop();
    input.handle(player);
  }
}

function updateMap() {
  map.update()
}

function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");

  g.clearRect(0, 0, canvas.width, canvas.height);

  return g;
}

function draw() {
  let g = createGraphics();
  drawMap(g);
  player.drawPlayer(g);
}

function drawMap(g: CanvasRenderingContext2D) {
  map.draw(g);
}

function gameLoop() {
  let before = Date.now();
  update();
  draw();
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(() => gameLoop(), sleep);
}

window.onload = () => {
  gameLoop();
}

const LEFT_KEY = "ArrowLeft";
const UP_KEY = "ArrowUp";
const RIGHT_KEY = "ArrowRight";
const DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", e => {
  if (e.key === LEFT_KEY || e.key === "a") inputs.push(new Left());
  else if (e.key === UP_KEY || e.key === "w") inputs.push(new Up());
  else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new Right());
  else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new Down());
});

