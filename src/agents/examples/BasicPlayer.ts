// // type BoardState = {
// //   cards: {
// //     level1: {
// //       id: number;
// //       color: Color;
// //       points: number;
// //       cost: {
// //         [color in Color]?: number;
// //       };
// //     }[];
// //     level2: {
// //       id: number;
// //       color: Color;
// //       points: number;
// //       cost: {
// //         [color in Color]?: number;
// //       };
// //     }[];
// //     level3: {
// //       id: number;
// //       color: Color;
// //       points: number;
// //       cost: {
// //         [color in Color]?: number;
// //       };
// //     }[];
// //   };
// //   tokens: {
// //     [color in Color]: number;
// //   };
// //   nobles: Noble[];
// // };

// // type Color = 'white' | 'blue' | 'green' | 'red' | 'black';

// // type Noble = {
// //   id: number;
// //   requirement: {
// //     [color in Color]: number;
// //   };
// //   points: number;
// // };

// // type Player = {
// //   name: string;
// //   playTurn: (
// //     opponentsStates: PlayerState[],
// //     selfState: PlayerState,
// //     boardState: BoardState
// //   ) => Transaction;
// // };

// // type PlayerState = {
// //   tokens: {
// //     [color in Color]?: number;
// //   };
// //   cards: {
// //     id: number;
// //     color: Color;
// //     points: number;
// //     cost: {
// //       [color in Color]?: number;
// //     };
// //   }[];
// //   points: number;
// //   nobles: Noble[];
// // };

// // type Transaction =
// //   | {
// //       type: 'CARD_BUYING';
// //       cardId: number;
// //     }
// //   | {
// //       type: 'TOKENS_EXCHANGE';
// //       tokens: {
// //         [color in Color]: number;
// //       };
// //     };

// import { playerCanSubmitTransaction } from './splendor-rules';
// import { PrintLogger } from './utils';

// /**

// A basic player that will always respect the rules, and eventually win.
// Strategy is basic:
// "If there are cards I can afford, I buy the best one among them (best = the card with the highest points).
// Otherwise, I collect the 3 most-needed important tokens"
// */
// export class BasicPlayer implements Player {
//   public readonly name: string;
//   private readonly logger: PrintLogger = new PrintLogger();

//   constructor(playerName: string) {
//     this.name = playerName;
//   }

//   public playTurn(
//     opponentsStates: PlayerState[],
//     selfState: PlayerState,
//     boardState: BoardState,
//   ): Transaction {
//     const bestAffordableCard: number | null = this.findTheBestAffordableCard(selfState, boardState);
//     if (bestAffordableCard !== null) {
//       return new Transaction.CardBuying(bestAffordableCard);
//     }

//     return this.buildAnAccurateTokensExchangeTransaction(selfState, boardState);
//   }

//   protected findTheBestAffordableCard(selfState: PlayerState, boardState: BoardState): number | null {
//     return Object.values(boardState.cards)
//       .flatMap((cards) => cards)
//       .sort((a, b) => b.points - a.points)
//       .find((card) => playerCanSubmitTransaction(selfState, new Transaction.CardBuying(card.id)))?.id ?? null;
//   }

//   private buildAnAccurateTokensExchangeTransaction(
//     selfState: PlayerState,
//     boardState: BoardState,
//   ): Transaction.TokensExchange {
//     const interestInColors: Map<Color, number> = this.estimateInterestInColors(boardState, selfState);
//     this.logger.v(this.name, `interest in colors: ${interestInColors}`);

//     const tokens: Map<Color, number> = this.tokensFromInterestMap(interestInColors, boardState, selfState);

//     return new Transaction.TokensExchange(tokens);
//   }

//   protected estimateInterestInColors(
//     boardState: BoardState,
//     selfState: PlayerState,
//   ): Map<Color, number> {
//     const interestInColors: Map<Color, number> = new Map(
//       Object.values(Color).map((color) => [color, Math.random() * (0.1 - 0.01) + 0.01]),
//     );

//     for (const cards of Object.values(boardState.cards)) {
//       for (const card of cards) {
//         const costGap: Map<Color, number> = Object.entries(card.cost)
//           .reduce((acc, [color, cost]) => {
//             const tokenIHaveOfThisColor: number = selfState.tokens[color] ?? 0;
//             const cardIHaveOfThisColor: number = selfState.cards.filter((c) => c.color === color).length;
//             const gap: number = Math.max(0, cost - tokenIHaveOfThisColor - cardIHaveOfThisColor);

//             return { ...acc, [color]: gap };
//           }, {})
//         Object.entries
//         Object.fromEntries((obj) => Object.fromEntries(Object.entries(obj).filter(([, gap]) => gap > 0)));

//         for (const [color, gap] of Object.entries(costGap)) {
//           const interest: number = 1 / gap;
//           interestInColors.set(color, interestInColors.get(color)! + interest);
//         }
//       }
//     }

//     for (const color of Object.values(Color)) {
//       interestInColors[color] = interestInColors[color] ?? Random.nextDouble(0.01, 0.1);
//     }
//     return interestInColors;
//   }

//   protected tokensFromInterestMap(
//     interestInColors: Map<Color, number>,
//     boardState: BoardState,
//     selfState: PlayerState
//   ): Map<Color, number> {
//     const interestConsideringBoardConstraint = Object.fromEntries(
//       Object.entries(interestInColors).filter(([color]) => boardState.tokens[color] ?? 0 > 0)
//     );
//     const colorsToTake = Object.entries(interestConsideringBoardConstraint)
//       .sort(([, interest1], [, interest2]) => interest2 - interest1)
//       .slice(0, 3)
//       .map(([color]) => color as Color);

//     const additionalColorsToReachThreeColor = Object.keys(boardState.tokens)
//       .filter((color) => boardState.tokens[color as Color] ?? 0 > 0 && !colorsToTake.includes(color as Color))
//       .slice(0, 3 - colorsToTake.length);

//     const mapOfColorsToTake = colorsToTake.reduce((map, color) => ({ ...map, [color]: 1 }), {});
//     logger.v(this.name, `colors to take: ${JSON.stringify(mapOfColorsToTake)}`);

//     const colorsToRemove = Object.entries(interestInColors)
//       .sort(([, interest1], [, interest2]) => interest1 - interest2)
//       .filter(
//         ([color]) =>
//           selfState.tokens[color] ?? mapOfColorsToTake[color] ?? 0 > 0
//       )
//       .slice(
//         0,
//         Math.max(
//           0,
//           Object.values(selfState.tokens).reduce((sum, count) => sum + count, 0) +
//           Object.keys(mapOfColorsToTake).length -
//           TOKENS_LIMIT_BY_PLAYER
//         )
//       )
//       .reduce((map, [color]) => ({ ...map, [color as Color]: -1 }), {});
//     logger.v(this.name, `colors to remove ${JSON.stringify(colorsToRemove)}`);

//     return mergeWith(mapOfColorsToTake, colorsToRemove);
//   }

//   public chooseNoble(
//     affordableNobles: Noble[],
//     selfState: PlayerState,
//     boardState: BoardState
//   ): Noble | null {
//     return affordableNobles.sort(
//       (noble1, noble2) =>
//         this.estimateNobleInterest(noble2, selfState, boardState) -
//         this.estimateNobleInterest(noble1, selfState, boardState)
//     )[0] ?? null;
//   }

//   protected estimateNobleInterest(
//     noble: Noble,
//     selfState: PlayerState,
//     boardState: BoardState
//   ): number {
//     const nobleCost = noble.cost;
//     const cardColors = selfState.cards.map((card) => card.color);
//     const tokensColors = Object.entries(selfState.tokens)
//       .filter(([color, count]) => count > 0)
//       .map(([color]) => color);
//     const colorCount = [...cardColors, ...tokensColors].reduce(
//       (countMap, color) => ({ ...countMap, [color]: (countMap[color] ?? 0) + 1 }),
//       {}
//     );
//     return nobleCost.reduce(
//       (totalInterest, [color, count]) =>
//         totalInterest + Math.max(0, count - (colorCount[color] ?? 0)),
//       0
//     );
//   }
// }

// export default BasicPlayer;
