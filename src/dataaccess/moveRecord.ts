export class MoveRecord {
  constructor(
    private _id: number,
    private _turnId: number,
    private _disc: number,
    private _x: number,
    private _y: number
  ) {}

  get disc(): number {
    return this._disc;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }
}
