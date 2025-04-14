import {connectMySQL} from "../../infrastructure/connection";
import {GameGateway} from "../../infrastructure/repository/game/gameGateway";
import {Disc} from "../../domain/model/turn/disc";
import {Point} from "../../domain/model/turn/point";
import {ApplicationError} from "../error/applicationError";
import {GameResult} from "../../domain/model/gameResult/gameResult";
import {TurnMySQLRepository} from "../../infrastructure/repository/turn/turnMySQLRepository";
import {GameMySQLRepository} from "../../infrastructure/repository/game/gameMySQLRepository";
import {GameResultMySQLRepository} from "../../infrastructure/repository/gameResult/gameResultMySQLRepository";

// Table Data Gatewayの宣言
const gameGateway = new GameGateway();

// Repository
const turnRepository = new TurnMySQLRepository();
const gameRepository = new GameMySQLRepository();
const gameResultRepository = new GameResultMySQLRepository();

class FindLatestGameTurnByTurnCountOutput {
    constructor(
        private _turnCount: number,
        private _board: number[][],
        private _nextDisc: number | undefined,
        private _winnerDisc: number | undefined
    ) {
    }

    get turnCount() {
        return this._turnCount;
    }

    get board() {
        return this._board;
    }

    get nextDisc() {
        return this._nextDisc;
    }

    get winnerDisc() {
        return this._winnerDisc;
    }
}

export class TurnService {
    async findLatestGameTurnByTurnCount(
        turnCount: number
    ): Promise<FindLatestGameTurnByTurnCountOutput> {
        const conn = await connectMySQL();
        try {
            const game = await gameRepository.findLatest(conn);
            if (!game) {
                throw new ApplicationError('LatestGameNotFound', "Latest game not found");
            }
            if (!game.id) {
                throw new Error("game.id not exist");
            }

            const turn = await turnRepository.findForGameIdAndTurnCount(
                conn,
                game.id,
                turnCount
            );

            let gameResult: GameResult | undefined;
            if (turn.gameEnded()) {
                gameResult = await gameResultRepository.findForGameId(conn, game.id);
            }

            return new FindLatestGameTurnByTurnCountOutput(
                turnCount,
                turn.board.discs,
                turn.nextDisc,
                gameResult?.winnerDisc
            );
        } finally {
            await conn.end();
        }
    }

    async registerTurn(turnCount: number, disc: Disc, point: Point) {
        const conn = await connectMySQL();
        try {
            // 一つ前のターンを取得する
            const game = await gameRepository.findLatest(conn);
            if (!game) {
                throw new ApplicationError('LatestGameNotFound', "Latest game not found");
            }
            if (!game.id) {
                throw new Error("game.id not exist");
            }

            const previousTurnCount = turnCount - 1;
            const previousTurn = await turnRepository.findForGameIdAndTurnCount(
                conn,
                game.id,
                previousTurnCount
            );

            // 石を置く
            const newTurn = previousTurn.placeNext(disc, point);

            // ターンを保存する
            await turnRepository.save(conn, newTurn);

            // 勝敗が決した場合、対戦結果を保存
            if (newTurn.gameEnded()) {
                const winnerDisc = newTurn.winnerDisc();
                const gameResult = new GameResult(game.id, winnerDisc, newTurn.endAt);
                await gameResultRepository.save(conn, gameResult);
            }

            await conn.commit();
        } finally {
            await conn.end();
        }
    }
}
