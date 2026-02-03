# Schachspiel

Ein optisch ansprechendes Schachspiel, entwickelt mit TypeScript und HTML. Das Projekt wurde vollständig von GitHub Copilot generiert und implementiert.

## Features

- ✅ Vollständige Schachregeln
- ✅ Zugvalidierung
- ✅ Schach-, Schachmatt- und Patt-Erkennung
- ✅ Zughistorie mit Notation
- ✅ Rückgängig-Funktion
- ✅ Moderne, ansprechende Benutzeroberfläche
- ✅ Responsive Design

## Installation

1. Abhängigkeiten installieren:
```bash
npm install
```

2. TypeScript kompilieren:
```bash
npm run build
```

3. Webserver starten (optional):
```bash
npm run serve
```

Alternativ können Sie die `index.html` direkt in einem Browser öffnen.

## Entwicklung

Für kontinuierliches Kompilieren während der Entwicklung:
```bash
npm run watch
```

## Projektstruktur

```
├── src/
│   ├── types.ts          # TypeScript-Typdefinitionen
│   ├── chessLogic.ts     # Schachspiel-Logik
│   └── chess.ts          # Haupt-Controller und UI
├── dist/                 # Kompilierte JavaScript-Dateien
├── index.html            # HTML-Struktur
├── styles.css            # Styling
├── tsconfig.json         # TypeScript-Konfiguration
└── package.json          # Projekt-Konfiguration
```

## Spielanleitung

1. Klicken Sie auf eine Figur, um sie auszuwählen
2. Gültige Züge werden auf dem Brett markiert
3. Klicken Sie auf ein markiertes Feld, um den Zug auszuführen
4. Die Zughistorie wird rechts angezeigt
5. Nutzen Sie "Zug zurück" um Züge rückgängig zu machen
6. "Neues Spiel" startet eine neue Partie

## Code-Struktur

Das Projekt folgt dem **Separation of Concerns** Prinzip:

- **types.ts**: Definiert alle TypeScript-Interfaces und -Typen
- **chessLogic.ts**: Enthält die reine Spiellogik ohne UI-Abhängigkeiten
- **chess.ts**: Verwaltet den Spielzustand und die UI-Interaktionen
- **styles.css**: Vollständiges Styling getrennt von der Logik

## Technologien

- TypeScript 5.3+
- HTML5
- CSS3 (mit Flexbox & Grid)
- Unicode-Schachfiguren
