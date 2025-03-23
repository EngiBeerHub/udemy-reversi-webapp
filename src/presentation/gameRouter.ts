import express from "express";
import { GameGateway } from "../dataaccess/gameGateway";
import { TrunGateway } from "../dataaccess/turnGateway";
import { MoveGateway } from "../dataaccess/moveGateway";
import { SquareGateway } from "../dataaccess/squareGateway";
import { connectMySQL } from "../dataaccess/connection";
import { DARK, INITIAL_BOARD } from "../application/constants";
import { GameService } from "../application/gameService";

export const gameRouter = express.Router();

const gameService = new GameService();

/**
 * 対戦を開始するAPI
 */
gameRouter.post("/api/games", async (req, res) => {
  await gameService.startNewGame();
  res.status(201).end();
});
