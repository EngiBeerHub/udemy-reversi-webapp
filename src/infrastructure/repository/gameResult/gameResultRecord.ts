export class GameResultRecord {
    constructor(
        private _id: number,
        private _gameId: number,
        private _winnerDisc: number,
        private _endAt: Date
    ) {
    }

    get gameId(): number {
        return this._gameId;
    }

    get winnerDisc(): number {
        return this._winnerDisc;
    }

    get endAt(): Date {
        return this._endAt;
    }
}
