export interface PlayerState {
  arg: string,
}

export interface BoardState {
  arg: string,
}

export interface Player {
  move(
    opponentsStates: PlayerState[],
    selfState: PlayerState,
    boardState: BoardState,
  ): void;
}

export class BasicPlayer implements Player {
  move(
    opponentsStates,
    selfState,
    boardState,
  ) {
    return {
      opponentsStates,
      selfState,
      boardState,
    }
  }
}
