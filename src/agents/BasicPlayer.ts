export interface Player {
  move(
    opponentsStates: PlayerState[],
    selfState: PlayerState,
    boardState: BoardState,
  ): void;
}

export class BasicPlayer implements Player {

}
