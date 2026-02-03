import { Piece, Position, PieceColor, PieceType } from './types.js';

/**
 * Klasse für die Schachspiel-Logik
 * Verwaltet Spielregeln, Zugvalidierung und Spielzustand
 */
export class ChessLogic {
    
    /**
     * Erstellt das initiale Schachbrett mit allen Figuren
     */
    static createInitialBoard(): (Piece | null)[][] {
        const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Schwarze Figuren
        board[0] = [
            { type: 'rook', color: 'black', hasMoved: false },
            { type: 'knight', color: 'black', hasMoved: false },
            { type: 'bishop', color: 'black', hasMoved: false },
            { type: 'queen', color: 'black', hasMoved: false },
            { type: 'king', color: 'black', hasMoved: false },
            { type: 'bishop', color: 'black', hasMoved: false },
            { type: 'knight', color: 'black', hasMoved: false },
            { type: 'rook', color: 'black', hasMoved: false }
        ];
        
        // Schwarze Bauern
        for (let col = 0; col < 8; col++) {
            board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
        }
        
        // Weiße Bauern
        for (let col = 0; col < 8; col++) {
            board[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
        }
        
        // Weiße Figuren
        board[7] = [
            { type: 'rook', color: 'white', hasMoved: false },
            { type: 'knight', color: 'white', hasMoved: false },
            { type: 'bishop', color: 'white', hasMoved: false },
            { type: 'queen', color: 'white', hasMoved: false },
            { type: 'king', color: 'white', hasMoved: false },
            { type: 'bishop', color: 'white', hasMoved: false },
            { type: 'knight', color: 'white', hasMoved: false },
            { type: 'rook', color: 'white', hasMoved: false }
        ];
        
        return board;
    }
    
    /**
     * Überprüft, ob eine Position auf dem Brett liegt
     */
    static isValidPosition(pos: Position): boolean {
        return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
    }
    
    /**
     * Berechnet alle gültigen Züge für eine Figur
     */
    static getValidMoves(
        board: (Piece | null)[][],
        from: Position,
        checkForCheck: boolean = true
    ): Position[] {
        const piece = board[from.row][from.col];
        if (!piece) return [];
        
        let moves: Position[] = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMoves(board, from, piece);
                break;
            case 'rook':
                moves = this.getRookMoves(board, from, piece);
                break;
            case 'knight':
                moves = this.getKnightMoves(board, from, piece);
                break;
            case 'bishop':
                moves = this.getBishopMoves(board, from, piece);
                break;
            case 'queen':
                moves = this.getQueenMoves(board, from, piece);
                break;
            case 'king':
                moves = this.getKingMoves(board, from, piece);
                break;
        }
        
        // Filtere Züge, die den eigenen König in Schach setzen würden
        if (checkForCheck) {
            moves = moves.filter(to => !this.wouldBeInCheck(board, from, to, piece.color));
        }
        
        return moves;
    }
    
    /**
     * Bauern-Bewegungslogik
     */
    private static getPawnMoves(board: (Piece | null)[][], from: Position, piece: Piece): Position[] {
        const moves: Position[] = [];
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        // Ein Feld vorwärts
        const oneForward = { row: from.row + direction, col: from.col };
        if (this.isValidPosition(oneForward) && !board[oneForward.row][oneForward.col]) {
            moves.push(oneForward);
            
            // Zwei Felder vorwärts vom Startfeld
            if (from.row === startRow) {
                const twoForward = { row: from.row + 2 * direction, col: from.col };
                if (!board[twoForward.row][twoForward.col]) {
                    moves.push(twoForward);
                }
            }
        }
        
        // Diagonal schlagen
        const captureLeft = { row: from.row + direction, col: from.col - 1 };
        const captureRight = { row: from.row + direction, col: from.col + 1 };
        
        for (const capture of [captureLeft, captureRight]) {
            if (this.isValidPosition(capture)) {
                const targetPiece = board[capture.row][capture.col];
                if (targetPiece && targetPiece.color !== piece.color) {
                    moves.push(capture);
                }
            }
        }
        
        return moves;
    }
    
    /**
     * Turm-Bewegungslogik
     */
    private static getRookMoves(board: (Piece | null)[][], from: Position, piece: Piece): Position[] {
        return this.getLinearMoves(board, from, piece, [
            { row: 1, col: 0 },   // unten
            { row: -1, col: 0 },  // oben
            { row: 0, col: 1 },   // rechts
            { row: 0, col: -1 }   // links
        ]);
    }
    
    /**
     * Springer-Bewegungslogik
     */
    private static getKnightMoves(board: (Piece | null)[][], from: Position, piece: Piece): Position[] {
        const moves: Position[] = [];
        const offsets = [
            { row: -2, col: -1 }, { row: -2, col: 1 },
            { row: -1, col: -2 }, { row: -1, col: 2 },
            { row: 1, col: -2 }, { row: 1, col: 2 },
            { row: 2, col: -1 }, { row: 2, col: 1 }
        ];
        
        for (const offset of offsets) {
            const to = { row: from.row + offset.row, col: from.col + offset.col };
            if (this.isValidPosition(to)) {
                const targetPiece = board[to.row][to.col];
                if (!targetPiece || targetPiece.color !== piece.color) {
                    moves.push(to);
                }
            }
        }
        
        return moves;
    }
    
    /**
     * Läufer-Bewegungslogik
     */
    private static getBishopMoves(board: (Piece | null)[][], from: Position, piece: Piece): Position[] {
        return this.getLinearMoves(board, from, piece, [
            { row: 1, col: 1 },    // rechts unten
            { row: 1, col: -1 },   // links unten
            { row: -1, col: 1 },   // rechts oben
            { row: -1, col: -1 }   // links oben
        ]);
    }
    
    /**
     * Dame-Bewegungslogik
     */
    private static getQueenMoves(board: (Piece | null)[][], from: Position, piece: Piece): Position[] {
        return [
            ...this.getRookMoves(board, from, piece),
            ...this.getBishopMoves(board, from, piece)
        ];
    }
    
    /**
     * König-Bewegungslogik
     */
    private static getKingMoves(board: (Piece | null)[][], from: Position, piece: Piece): Position[] {
        const moves: Position[] = [];
        const offsets = [
            { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
            { row: 0, col: -1 },                        { row: 0, col: 1 },
            { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 }
        ];
        
        for (const offset of offsets) {
            const to = { row: from.row + offset.row, col: from.col + offset.col };
            if (this.isValidPosition(to)) {
                const targetPiece = board[to.row][to.col];
                if (!targetPiece || targetPiece.color !== piece.color) {
                    moves.push(to);
                }
            }
        }
        
        return moves;
    }
    
    /**
     * Hilfsmethode für lineare Bewegungen (Turm, Läufer, Dame)
     */
    private static getLinearMoves(
        board: (Piece | null)[][],
        from: Position,
        piece: Piece,
        directions: { row: number; col: number }[]
    ): Position[] {
        const moves: Position[] = [];
        
        for (const dir of directions) {
            let row = from.row + dir.row;
            let col = from.col + dir.col;
            
            while (this.isValidPosition({ row, col })) {
                const targetPiece = board[row][col];
                
                if (!targetPiece) {
                    moves.push({ row, col });
                } else {
                    if (targetPiece.color !== piece.color) {
                        moves.push({ row, col });
                    }
                    break;
                }
                
                row += dir.row;
                col += dir.col;
            }
        }
        
        return moves;
    }
    
    /**
     * Findet die Position des Königs einer bestimmten Farbe
     */
    static findKing(board: (Piece | null)[][], color: PieceColor): Position | null {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }
    
    /**
     * Überprüft, ob ein Feld von einer bestimmten Farbe angegriffen wird
     */
    static isSquareUnderAttack(
        board: (Piece | null)[][],
        position: Position,
        attackerColor: PieceColor
    ): boolean {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color === attackerColor) {
                    const moves = this.getValidMoves(board, { row, col }, false);
                    if (moves.some(m => m.row === position.row && m.col === position.col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    /**
     * Überprüft, ob ein Spieler im Schach steht
     */
    static isInCheck(board: (Piece | null)[][], color: PieceColor): boolean {
        const kingPos = this.findKing(board, color);
        if (!kingPos) return false;
        
        const opponentColor: PieceColor = color === 'white' ? 'black' : 'white';
        return this.isSquareUnderAttack(board, kingPos, opponentColor);
    }
    
    /**
     * Überprüft, ob ein Zug den eigenen König in Schach setzen würde
     */
    private static wouldBeInCheck(
        board: (Piece | null)[][],
        from: Position,
        to: Position,
        color: PieceColor
    ): boolean {
        // Simuliere den Zug
        const boardCopy = board.map(row => [...row]);
        const piece = boardCopy[from.row][from.col];
        boardCopy[to.row][to.col] = piece;
        boardCopy[from.row][from.col] = null;
        
        return this.isInCheck(boardCopy, color);
    }
    
    /**
     * Überprüft, ob ein Spieler keine gültigen Züge mehr hat
     */
    static hasNoValidMoves(board: (Piece | null)[][], color: PieceColor): boolean {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getValidMoves(board, { row, col });
                    if (moves.length > 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    /**
     * Generiert eine Schachnotation für einen Zug
     */
    static generateNotation(
        _board: (Piece | null)[][],
        from: Position,
        to: Position,
        piece: Piece,
        capturedPiece?: Piece
    ): string {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        
        const pieceSymbols: { [key in PieceType]: string } = {
            king: 'K',
            queen: 'Q',
            rook: 'R',
            bishop: 'B',
            knight: 'N',
            pawn: ''
        };
        
        let notation = pieceSymbols[piece.type];
        
        if (piece.type === 'pawn' && capturedPiece) {
            notation = files[from.col];
        }
        
        if (capturedPiece) {
            notation += 'x';
        }
        
        notation += files[to.col] + ranks[to.row];
        
        return notation;
    }
}
