// Typen und Interfaces für das Schachspiel

export type PieceColor = 'white' | 'black';
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export interface Position {
    row: number;
    col: number;
}

export interface Piece {
    type: PieceType;
    color: PieceColor;
    hasMoved: boolean;
}

export interface Move {
    from: Position;
    to: Position;
    piece: Piece;
    capturedPiece?: Piece;
    notation: string;
}

export interface GameState {
    board: (Piece | null)[][];
    currentPlayer: PieceColor;
    moveHistory: Move[];
    isCheck: boolean;
    isCheckmate: boolean;
    isStalemate: boolean;
    selectedSquare: Position | null;
    validMoves: Position[];
}
