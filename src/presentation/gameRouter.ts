import express from "express";
import {StartNewGameUseCase} from "../application/useCase/startNewGameUseCase";
import {GameMySQLRepository} from "../infrastructure/repository/game/gameMySQLRepository";
import {TurnMySQLRepository} from "../infrastructure/repository/turn/turnMySQLRepository";

export const gameRouter = express.Router();

const gameService = new StartNewGameUseCase(
    new GameMySQLRepository(),
    new TurnMySQLRepository()
);

/**
 * 対戦を開始するAPI
 */
gameRouter.post("/api/games", async (req, res) => {
    await gameService.run();
    res.status(201).end();
});
