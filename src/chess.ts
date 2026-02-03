import { ChessLogic } from './chessLogic.js';
import { GameState, Position, Piece, Move } from './types.js';

/**
 * Hauptklasse für das Schachspiel
 * Verwaltet den Spielzustand und die Benutzerinteraktion
 */
export class ChessGame {
    private state: GameState;
    private boardElement: HTMLElement;
    private lastMoveSquares: Position[] = [];
    
    constructor() {
        this.state = this.createInitialState();
        this.boardElement = document.getElementById('chessboard')!;
        this.initialize();
    }
    
    /**
     * Erstellt den initialen Spielzustand
     */
    private createInitialState(): GameState {
        return {
            board: ChessLogic.createInitialBoard(),
            currentPlayer: 'white',
            moveHistory: [],
            isCheck: false,
            isCheckmate: false,
            isStalemate: false,
            selectedSquare: null,
            validMoves: []
        };
    }
    
    /**
     * Initialisiert das Spiel
     */
    private initialize(): void {
        this.renderBoard();
        this.setupEventListeners();
        this.updateUI();
    }
    
    /**
     * Rendert das Schachbrett
     */
    private renderBoard(): void {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row.toString();
                square.dataset.col = col.toString();
                
                const piece = this.state.board[row][col];
                if (piece) {
                    square.textContent = this.getPieceSymbol(piece);
                }
                
                this.boardElement.appendChild(square);
            }
        }
    }
    
    /**
     * Konvertiert eine Figur zu ihrem Unicode-Symbol
     */
    private getPieceSymbol(piece: Piece): string {
        const symbols: { [key: string]: { white: string; black: string } } = {
            king: { white: '♔', black: '♚' },
            queen: { white: '♕', black: '♛' },
            rook: { white: '♖', black: '♜' },
            bishop: { white: '♗', black: '♝' },
            knight: { white: '♘', black: '♞' },
            pawn: { white: '♙', black: '♟' }
        };
        
        return symbols[piece.type][piece.color];
    }
    
    /**
     * Richtet Event-Listener ein
     */
    private setupEventListeners(): void {
        // Klick auf Schachbrett
        this.boardElement.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('square')) {
                const row = parseInt(target.dataset.row!);
                const col = parseInt(target.dataset.col!);
                this.handleSquareClick({ row, col });
            }
        });
        
        // Neues Spiel Button
        const newGameBtn = document.getElementById('newGameBtn');
        newGameBtn?.addEventListener('click', () => this.newGame());
        
        // Rückgängig Button
        const undoBtn = document.getElementById('undoBtn');
        undoBtn?.addEventListener('click', () => this.undoMove());
    }
    
    /**
     * Behandelt Klicks auf Schachfeld
     */
    private handleSquareClick(position: Position): void {
        if (this.state.isCheckmate || this.state.isStalemate) {
            return;
        }
        
        const piece = this.state.board[position.row][position.col];
        
        // Wenn ein Feld ausgewählt ist und der Klick auf ein gültiges Zielfeld erfolgt
        if (this.state.selectedSquare) {
            const isValidMove = this.state.validMoves.some(
                m => m.row === position.row && m.col === position.col
            );
            
            if (isValidMove) {
                this.makeMove(this.state.selectedSquare, position);
                this.state.selectedSquare = null;
                this.state.validMoves = [];
            } else if (piece && piece.color === this.state.currentPlayer) {
                // Wähle eine andere eigene Figur aus
                this.selectSquare(position);
            } else {
                // Deselektiere
                this.state.selectedSquare = null;
                this.state.validMoves = [];
            }
        } else if (piece && piece.color === this.state.currentPlayer) {
            // Wähle eine Figur aus
            this.selectSquare(position);
        }
        
        this.updateBoard();
    }
    
    /**
     * Wählt ein Feld aus und zeigt gültige Züge
     */
    private selectSquare(position: Position): void {
        this.state.selectedSquare = position;
        this.state.validMoves = ChessLogic.getValidMoves(this.state.board, position);
    }
    
    /**
     * Führt einen Zug aus
     */
    private makeMove(from: Position, to: Position): void {
        const piece = this.state.board[from.row][from.col]!;
        const capturedPiece = this.state.board[to.row][to.col] || undefined;
        
        // Aktualisiere das Brett
        this.state.board[to.row][to.col] = { ...piece, hasMoved: true };
        this.state.board[from.row][from.col] = null;
        
        // Erstelle Zug-Notation
        const notation = ChessLogic.generateNotation(this.state.board, from, to, piece, capturedPiece);
        
        // Speichere den Zug
        const move: Move = {
            from,
            to,
            piece: { ...piece },
            capturedPiece,
            notation
        };
        this.state.moveHistory.push(move);
        
        // Speichere letzten Zug für Hervorhebung
        this.lastMoveSquares = [from, to];
        
        // Wechsle Spieler
        this.state.currentPlayer = this.state.currentPlayer === 'white' ? 'black' : 'white';
        
        // Überprüfe Spielzustand
        this.checkGameState();
        
        // Aktualisiere UI
        this.updateUI();
    }
    
    /**
     * Überprüft den aktuellen Spielzustand (Schach, Matt, Patt)
     */
    private checkGameState(): void {
        this.state.isCheck = ChessLogic.isInCheck(this.state.board, this.state.currentPlayer);
        const hasNoMoves = ChessLogic.hasNoValidMoves(this.state.board, this.state.currentPlayer);
        
        if (hasNoMoves) {
            if (this.state.isCheck) {
                this.state.isCheckmate = true;
            } else {
                this.state.isStalemate = true;
            }
        }
    }
    
    /**
     * Macht den letzten Zug rückgängig
     */
    private undoMove(): void {
        if (this.state.moveHistory.length === 0) return;
        
        const lastMove = this.state.moveHistory.pop()!;
        
        // Stelle Brett wieder her
        this.state.board[lastMove.from.row][lastMove.from.col] = {
            ...lastMove.piece,
            hasMoved: this.state.moveHistory.some(
                m => m.from.row === lastMove.from.row && m.from.col === lastMove.from.col
            )
        };
        this.state.board[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece || null;
        
        // Wechsle Spieler zurück
        this.state.currentPlayer = this.state.currentPlayer === 'white' ? 'black' : 'white';
        
        // Setze Spielzustand zurück
        this.state.isCheckmate = false;
        this.state.isStalemate = false;
        this.state.selectedSquare = null;
        this.state.validMoves = [];
        
        // Aktualisiere letzten Zug
        if (this.state.moveHistory.length > 0) {
            const prevMove = this.state.moveHistory[this.state.moveHistory.length - 1];
            this.lastMoveSquares = [prevMove.from, prevMove.to];
        } else {
            this.lastMoveSquares = [];
        }
        
        this.checkGameState();
        this.updateBoard();
        this.updateUI();
    }
    
    /**
     * Startet ein neues Spiel
     */
    private newGame(): void {
        this.state = this.createInitialState();
        this.lastMoveSquares = [];
        this.renderBoard();
        this.updateUI();
    }
    
    /**
     * Aktualisiert das Schachbrett-Display
     */
    private updateBoard(): void {
        const squares = this.boardElement.querySelectorAll('.square');
        
        squares.forEach((square) => {
            const elem = square as HTMLElement;
            const row = parseInt(elem.dataset.row!);
            const col = parseInt(elem.dataset.col!);
            
            // Entferne alle Hervorhebungen
            elem.classList.remove('selected', 'valid-move', 'has-piece', 'last-move', 'in-check');
            
            // Aktualisiere Figurensymbol
            const piece = this.state.board[row][col];
            elem.textContent = piece ? this.getPieceSymbol(piece) : '';
            
            // Markiere ausgewähltes Feld
            if (this.state.selectedSquare &&
                this.state.selectedSquare.row === row &&
                this.state.selectedSquare.col === col) {
                elem.classList.add('selected');
            }
            
            // Markiere gültige Züge
            const isValidMove = this.state.validMoves.some(m => m.row === row && m.col === col);
            if (isValidMove) {
                elem.classList.add('valid-move');
                if (piece) {
                    elem.classList.add('has-piece');
                }
            }
            
            // Markiere letzten Zug
            const isLastMoveSquare = this.lastMoveSquares.some(m => m.row === row && m.col === col);
            if (isLastMoveSquare) {
                elem.classList.add('last-move');
            }
            
            // Markiere König im Schach
            if (this.state.isCheck && piece && piece.type === 'king' && piece.color === this.state.currentPlayer) {
                elem.classList.add('in-check');
            }
        });
    }
    
    /**
     * Aktualisiert die UI-Elemente
     */
    private updateUI(): void {
        // Aktueller Spieler
        const currentPlayerElem = document.getElementById('currentPlayer');
        if (currentPlayerElem) {
            currentPlayerElem.textContent = this.state.currentPlayer === 'white' ? 'Weiß' : 'Schwarz';
            currentPlayerElem.className = `player-indicator ${this.state.currentPlayer}`;
        }
        
        // Spielstatus
        const gameStatusElem = document.getElementById('gameStatus');
        if (gameStatusElem) {
            if (this.state.isCheckmate) {
                const winner = this.state.currentPlayer === 'white' ? 'Schwarz' : 'Weiß';
                gameStatusElem.textContent = `Schachmatt! ${winner} gewinnt!`;
            } else if (this.state.isStalemate) {
                gameStatusElem.textContent = 'Patt! Unentschieden!';
            } else if (this.state.isCheck) {
                gameStatusElem.textContent = 'Schach!';
            } else {
                gameStatusElem.textContent = 'Spiel läuft';
            }
        }
        
        // Zughistorie
        this.updateMoveHistory();
        
        // Rückgängig-Button
        const undoBtn = document.getElementById('undoBtn') as HTMLButtonElement;
        if (undoBtn) {
            undoBtn.disabled = this.state.moveHistory.length === 0;
        }
    }
    
    /**
     * Aktualisiert die Zughistorie-Anzeige
     */
    private updateMoveHistory(): void {
        const moveListElem = document.getElementById('moveList');
        if (!moveListElem) return;
        
        moveListElem.innerHTML = '';
        
        for (let i = 0; i < this.state.moveHistory.length; i++) {
            const move = this.state.moveHistory[i];
            const moveItem = document.createElement('div');
            moveItem.className = 'move-item';
            
            const moveNumber = Math.floor(i / 2) + 1;
            const color = i % 2 === 0 ? 'Weiß' : 'Schwarz';
            
            moveItem.textContent = `${moveNumber}. ${color}: ${move.notation}`;
            moveListElem.appendChild(moveItem);
        }
        
        // Scrolle zum letzten Zug
        moveListElem.scrollTop = moveListElem.scrollHeight;
    }
}

// Starte das Spiel wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
});
