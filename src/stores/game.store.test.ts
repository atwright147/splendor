import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import deckAll from '../../ref/cards.json';
import {
  type Card,
  type Noble,
  type PlayerState,
  type Tokens,
  initialBoardState,
  useGameStore,
} from './game.store';

describe('Game Store', () => {
  let defaultTokens: Tokens;

  beforeEach(() => {
    const { result } = renderHook(() => useGameStore());

    defaultTokens = {
      red: 0,
      blue: 0,
      green: 0,
      white: 0,
      black: 0,
      gold: 0,
    };

    result.current.board = { ...initialBoardState };

    act(() => result.current.setCurrentPlayerIndex(0));
    act(() => result.current.resetBoardSnapshot());
  });

  describe('deal()', () => {
    it('returns early when no players are created', () => {
      const { result } = renderHook(() => useGameStore());

      result.current.deal();

      expect(result.current.board).toEqual({ ...initialBoardState });
    });

    describe('sets the correct number of tokens and nobles based on the number of players', () => {
      it('2 players, 4 tokens, 3 nobles', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => result.current.createPlayers(2));
        act(() => result.current.deal());

        expect(result.current.board.tokens.black).toBe(4);
        expect(result.current.board.nobles.length).toBe(3);
      });

      it('3 players, 5 tokens, 4 nobles', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => result.current.createPlayers(3));
        act(() => result.current.deal());

        expect(result.current.board.tokens.black).toBe(5);
        expect(result.current.board.nobles.length).toBe(4);
      });

      it('4 players, 7 tokens, 5 nobles', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => result.current.createPlayers(4));
        act(() => result.current.deal());

        expect(result.current.board.tokens.black).toBe(7);
        expect(result.current.board.nobles.length).toBe(5);
      });

      it('should deal 5 unique nobles', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => result.current.createPlayers(4));
        act(() => result.current.deal());

        expect(
          new Set(result.current.board.nobles.map((noble) => noble.id)).size,
        ).toBe(5);
      });
    });

    it('deals the correct number of cards for each level', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.deal());

      expect(result.current.board.cards.level1.length).toBe(4);
      expect(result.current.board.cards.level2.length).toBe(4);
      expect(result.current.board.cards.level3.length).toBe(4);
    });

    it('removes dealt cards from the deck', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.init());

      const initialDeckLength = result.current.deck.length;

      act(() => result.current.createPlayers(2));
      act(() => result.current.deal());

      expect(result.current.deck.length).toBeLessThan(initialDeckLength);
    });

    it('sets the correct board state', () => {
      const { result } = renderHook(() => useGameStore());

      result.current.deck = [...deckAll] as Card[];
      result.current.board = { ...initialBoardState };

      act(() => result.current.createPlayers(2));
      act(() => result.current.deal());

      expect(result.current.board).toEqual({
        cards: {
          level1: expect.any(Array),
          level2: expect.any(Array),
          level3: expect.any(Array),
        },
        tokens: {
          gold: 5,
          black: 4,
          blue: 4,
          green: 4,
          red: 4,
          white: 4,
        },
        nobles: expect.any(Array),
      });
    });
  });

  describe('setCurrentPlayerIndex()', () => {
    it('sets the current player index', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.setCurrentPlayerIndex(2));

      expect(result.current.currentPlayerIndex).toBe(2);
    });
  });

  describe('createPlayers()', () => {
    it('creates players', () => {
      const { result } = renderHook(() => useGameStore());
      const quantity = 4;

      result.current.players = [];

      expect(result.current.players.length).toBe(0);

      act(() => result.current.createPlayers(quantity));

      expect(result.current.players.length).toBe(quantity);
    });

    it('does not create more than 4 players', () => {
      vi.spyOn(console, 'info').mockImplementation(() => {});

      const { result } = renderHook(() => useGameStore());
      const quantity = 5;

      act(() => result.current.createPlayers(quantity));

      expect(result.current.players.length).toBe(4);
    });
  });

  describe('getCurrentPlayer()', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.setCurrentPlayerIndex(0));
    });

    it('should get the current player', () => {
      const { result } = renderHook(() => useGameStore());

      const player2 = result.current.players[1];

      result.current.setCurrentPlayerIndex(1);

      expect(result.current.getCurrentPlayer()).toEqual(player2);
    });
  });

  describe('getPlayerById()', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
    });

    it('should get a player by their ID', () => {
      const { result } = renderHook(() => useGameStore());

      const player2 = result.current.players[1];

      expect(result.current.getPlayerById(player2.uuid)).toEqual(player2);
    });
  });

  describe('getPlayerByIndex()', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
    });

    it('should get a player by their index', () => {
      const { result } = renderHook(() => useGameStore());

      const player2 = result.current.players[1];

      expect(result.current.getPlayerByIndex(1)).toEqual(player2);
    });
  });

  describe('resetGame()', () => {
    it('should reset the game state', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.init());
      act(() => result.current.createPlayers(2));
      act(() => result.current.deal());

      expect(result.current.board).not.toEqual(initialBoardState);
      expect(result.current.players.length).toBeGreaterThan(0);
      expect(result.current.currentPlayerIndex).toBe(0);
      expect(result.current.pickedCard).toBeNull();
    });
  });

  describe('pickToken()', () => {
    let defaultTokens: Tokens;

    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());

      defaultTokens = {
        red: 0,
        blue: 0,
        green: 0,
        white: 0,
        black: 0,
        gold: 0,
      };

      result.current.pickedTokens = defaultTokens;
    });

    it('reserves a token when no tokens are reserved and available tokens are not less than 4', () => {
      vi.spyOn(console, 'info').mockImplementation(() => {});

      const { result } = renderHook(() => useGameStore());
      const tokenColor = 'red';
      result.current.boardSnapshot.tokens[tokenColor] = 4;

      act(() => result.current.pickToken(tokenColor));

      expect(result.current.pickedTokens[tokenColor]).toBe(1);
    });

    it('given 4 tokens of the same color are on the board and no other tokens are reserved, should reserve 2 tokens of the same color', () => {
      const { result } = renderHook(() => useGameStore());
      const tokenColor = 'red';
      const token1 = tokenColor;
      const token2 = tokenColor;

      result.current.boardSnapshot.tokens[tokenColor] = 4;

      act(() => result.current.pickToken(token1));
      act(() => result.current.pickToken(token2));

      expect(result.current.pickedTokens[tokenColor]).toBe(2);
    });

    it('given 4 tokens of the same color are on the board and tokens of other colors are reserved, should not reserve a second token', () => {
      const { result } = renderHook(() => useGameStore());
      const tokenColor = 'red';
      const otherTokenColor = 'blue';
      const token1 = tokenColor;
      const token2 = otherTokenColor;
      const token3 = tokenColor;

      result.current.board = {
        ...initialBoardState,
      };
      result.current.boardSnapshot = {
        ...initialBoardState,
      };
      result.current.pickedTokens = {
        ...defaultTokens,
      };
      result.current.boardSnapshot.tokens[tokenColor] = 4;
      result.current.boardSnapshot.tokens[otherTokenColor] = 4;

      act(() => result.current.createPlayers(2));
      act(() => result.current.pickToken(token1));
      act(() => result.current.pickToken(token2));
      act(() => result.current.pickToken(token3));

      expect(result.current.pickedTokens[tokenColor]).toBe(1);
    });

    it('reserves a token when a token of a different color is already reserved', () => {
      const { result } = renderHook(() => useGameStore());
      const token1 = 'red';
      const token2 = 'blue';

      result.current.board = {
        ...initialBoardState,
      };
      result.current.boardSnapshot = {
        ...initialBoardState,
      };
      result.current.pickedTokens = {
        ...defaultTokens,
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.pickToken(token1));
      act(() => result.current.pickToken(token2));

      expect(result.current.pickedTokens[token1]).toBe(1);
      expect(result.current.pickedTokens[token2]).toBe(1);
    });

    it('does not reserve a token when a token of the same color is already reserved and other tokens are reserved', () => {
      const { result } = renderHook(() => useGameStore());
      const token1 = 'red';
      const token2 = 'blue';
      const token3 = 'red';

      result.current.board = {
        ...initialBoardState,
      };
      result.current.boardSnapshot = {
        ...initialBoardState,
      };
      result.current.pickedTokens = {
        ...defaultTokens,
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.pickToken(token1));
      act(() => result.current.pickToken(token2));
      act(() => result.current.pickToken(token3));

      expect(result.current.pickedTokens[token1]).toBe(1);
      expect(result.current.pickedTokens[token2]).toBe(1);
      expect(result.current.pickedTokens[token3]).toBe(1); // should not be 2
    });

    it('does not reserve a token when the available tokens are less than 4', () => {
      const { result } = renderHook(() => useGameStore());
      const token = 'red';

      // simulate available tokens being less than 4
      result.current.board.tokens.red = 3;

      act(() => result.current.pickToken(token));

      expect(result.current.pickedTokens).not.toContain(token);
    });
  });

  describe('canAffordCard()', () => {
    it('returns true if the player can afford the card', () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.players[0].tokens.red = 1;
      result.current.players[0].tokens.green = 2;
      result.current.players[0].tokens.blue = 0;
      result.current.players[0].tokens.black = 0;
      result.current.players[0].tokens.white = 0;

      expect(result.current.canAffordCard(card)).toBe(true);
    });

    it('returns false if the player cannot afford the card', () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.players[0].tokens.red = 1;
      result.current.players[0].tokens.green = 0;
      result.current.players[0].tokens.blue = 0;
      result.current.players[0].tokens.black = 0;
      result.current.players[0].tokens.white = 0;
      result.current.players[0].tokens.gold = 0;

      expect(result.current.canAffordCard(card)).toBe(false);
    });

    it('returns true if the player cannot afford the card with token but has enough gold', () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setCurrentPlayerIndex(0));

      result.current.players[0].tokens.red = 1;
      result.current.players[0].tokens.green = 1;
      result.current.players[0].tokens.blue = 0;
      result.current.players[0].tokens.black = 0;
      result.current.players[0].tokens.white = 0;
      result.current.players[0].tokens.gold = 1;

      expect(result.current.canAffordCard(card)).toBe(true);
    });
  });

  describe('commitCard()', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());
      const quantity = 2;

      act(() => result.current.createPlayers(quantity));
    });

    it("adds card to current player's hand", () => {
      const { result } = renderHook(() => useGameStore());
      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      act(() => result.current.setCurrentPlayerIndex(0));

      const player = result.current.getCurrentPlayer();
      player.tokens = {
        red: 1,
        green: 2,
        blue: 0,
        black: 0,
        white: 0,
        gold: 0,
      };

      act(() => result.current.pickCard(card));
      act(() => result.current.commitCard());

      expect(result.current.players[0].cards).toContain(card);
    });

    describe('pickCard()', () => {
      let player: PlayerState;

      beforeEach(() => {
        const { result } = renderHook(() => useGameStore());

        act(() => result.current.init());
        act(() => result.current.deal());
        act(() => result.current.createPlayers(2));
        act(() => result.current.setCurrentPlayerIndex(0));

        player = result.current.getCurrentPlayer();
      });

      it('reserves a card for the current player', () => {
        const { result } = renderHook(() => useGameStore());
        const card: Card = {
          id: 'mockUuid-1',
          cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
          prestige: 1,
          gem: 'red',
          level: 1,
        };

        player.tokens = {
          red: 1,
          green: 2,
          blue: 0,
          black: 0,
          white: 0,
          gold: 0,
        };

        act(() => result.current.pickCard(card));

        expect(result.current.pickedCard).toEqual({ boardIndex: -1, card });
      });

      it('reserves a card when there are multiple players', () => {
        const { result } = renderHook(() => useGameStore());
        const card: Card = {
          id: 'mockUuid-1',
          cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
          prestige: 1,
          gem: 'red',
          level: 1,
        };

        result.current.players[1].tokens = {
          red: 1,
          green: 2,
          blue: 0,
          black: 0,
          white: 0,
          gold: 0,
        };

        act(() => result.current.setCurrentPlayerIndex(1));
        act(() => result.current.pickCard(card));

        expect(result.current.pickedCard).toEqual({ boardIndex: -1, card });
      });

      it('removes card from the board', () => {
        const { result } = renderHook(() => useGameStore());

        result.current.board = {
          ...initialBoardState,
        };
        result.current.boardSnapshot = {
          ...initialBoardState,
        };
        result.current.pickedTokens = {
          ...defaultTokens,
        };

        act(() => result.current.init());
        act(() => result.current.deal());

        act(() => result.current.createPlayers(2));
        const card = result.current.board.cards.level1[0];

        act(() => result.current.setCurrentPlayerIndex(0));
        const player = result.current.getCurrentPlayer();
        player.tokens = { ...card.cost, gold: 0 };

        act(() => result.current.pickCard(card));

        expect(result.current.board.cards.level1).not.toContain(card);
      });
    });
  });

  describe('claimNoble()', () => {
    it('should update the current player with the noble prestige and add the noble to the nobles list', () => {
      const { result } = renderHook(() => useGameStore());
      const noble: Noble = {
        id: '1',
        prestige: 10,
        cost: { red: 1, green: 1, blue: 1, black: 0, white: 0 },
      };

      result.current.board = {
        ...initialBoardState,
      };
      result.current.boardSnapshot = {
        ...initialBoardState,
      };
      result.current.pickedTokens = {
        ...defaultTokens,
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());

      act(() => {
        result.current.claimNoble(noble);
      });

      expect(
        result.current.players[result.current.currentPlayerIndex].prestige,
      ).toBe(10);
      expect(
        result.current.players[result.current.currentPlayerIndex].nobles,
      ).toContainEqual(noble);
    });

    it('should remove the noble from the nobles list', () => {
      const { result } = renderHook(() => useGameStore());
      result.current.board = {
        ...initialBoardState,
      };
      result.current.boardSnapshot = {
        ...initialBoardState,
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());

      const noble = result.current.board.nobles[0];

      result.current.pickedTokens = {
        ...noble.cost,
      };

      act(() => result.current.claimNoble(noble));

      expect(result.current.board.nobles).not.toContainEqual(noble);
    });

    it('should not update other players', () => {
      const { result } = renderHook(() => useGameStore());
      result.current.board = {
        ...initialBoardState,
      };
      result.current.boardSnapshot = {
        ...initialBoardState,
      };

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());

      const noble = result.current.board.nobles[0];

      result.current.pickedTokens = {
        ...noble.cost,
      };

      act(() => result.current.claimNoble(noble));

      const otherPlayerIndex = result.current.currentPlayerIndex === 0 ? 1 : 0;

      expect(result.current.players[otherPlayerIndex].prestige).toBe(0);
      expect(
        result.current.players[otherPlayerIndex].nobles,
      ).not.toContainEqual(noble);
    });
  });

  describe('nextPlayer()', () => {
    it('selects the next player when there are multiple players', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(3));

      expect(result.current.currentPlayerIndex).toBe(0);

      act(() => result.current.nextPlayer());

      expect(result.current.currentPlayerIndex).toBe(1);
    });

    it('wraps around to the first player when current player is the last player', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(3));

      expect(result.current.currentPlayerIndex).toBe(0);

      act(() => result.current.nextPlayer());
      act(() => result.current.nextPlayer());
      act(() => result.current.nextPlayer());

      expect(result.current.currentPlayerIndex).toBe(0);
    });

    it('does not change when there is only one player', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(1));

      expect(result.current.currentPlayerIndex).toBe(0);

      act(() => result.current.nextPlayer());

      expect(result.current.currentPlayerIndex).toBe(0);
    });

    it('should update `boardSnapshot` state', () => {
      const { result } = renderHook(() => useGameStore());

      result.current.board = {
        cards: {
          level1: [],
          level2: [],
          level3: [],
        },
        tokens: {
          red: 0,
          green: 0,
          blue: 0,
          white: 0,
          black: 0,
          gold: 0,
        },
        nobles: [],
      };

      result.current.boardSnapshot = result.current.board;

      act(() => result.current.createPlayers(2));

      expect(result.current.boardSnapshot).toEqual(result.current.board);

      result.current.board = {
        cards: {
          level1: [],
          level2: [],
          level3: [],
        },
        tokens: {
          red: 4,
          green: 0,
          blue: 0,
          white: 0,
          black: 0,
          gold: 0,
        },
        nobles: [],
      };

      act(() => result.current.nextPlayer());

      expect(result.current.boardSnapshot).toEqual(result.current.board);
    });
  });

  describe('canEndTurn()', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.createPlayers(2));
      act(() => result.current.init());
      act(() => result.current.deal());
      act(() => result.current.setBoardSnapshot());

      result.current.pickedCard = null;
      result.current.pickedTokens = {
        red: 0,
        green: 0,
        blue: 0,
        black: 0,
        white: 0,
        gold: 0,
      } as Tokens;
    });

    it('should return true if a card is picked and no tokens are picked', () => {
      const { result } = renderHook(() => useGameStore());

      const player = result.current.getCurrentPlayer();
      player.tokens = {
        red: 1,
        green: 2,
        blue: 0,
        black: 0,
        white: 0,
        gold: 0,
      };

      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      act(() => result.current.pickCard(card));

      expect(result.current.canEndTurn()).toBe(true);
    });

    it('should return true if no card is picked but three different tokens are picked', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.pickToken('red'));
      act(() => result.current.pickToken('green'));
      act(() => result.current.pickToken('blue'));

      expect(result.current.canEndTurn()).toBe(true);
    });

    it('should return true if no card is picked but two tokens of the same color are picked', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.pickToken('red'));
      act(() => result.current.pickToken('red'));

      expect(result.current.canEndTurn()).toBe(true);
    });

    it('should return false if no card is picked and only one token is picked', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => result.current.pickToken('red'));

      expect(result.current.canEndTurn()).toBe(false);
    });

    it('should return false if no card or tokens are picked', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.canEndTurn()).toBe(false);
    });

    it('should return false if a card is picked but tokens are also picked', () => {
      const { result } = renderHook(() => useGameStore());

      const card: Card = {
        id: 'mockUuid-1',
        cost: { red: 1, green: 2, blue: 0, black: 0, white: 0 },
        prestige: 1,
        gem: 'red',
        level: 1,
      };

      act(() => result.current.pickCard(card));
      act(() => result.current.pickToken('red'));

      expect(result.current.canEndTurn()).toBe(false);
    });
  });
});
