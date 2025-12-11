#ifndef GAME_H
#define GAME_H

#include <Arduino.h>
#include "config.h"

class Game {
    public:
        void init();

        // Sequence
        void setSequence(const String seq);
        void setMode(GameMode mode);

        // Gameplay
        void blinkStart();                    // Clignotement 3x avant sequence
        void playSequence();                  // Joue la sequence avec timing selon mode
        bool playerTurn();                    // Tour du joueur
        void gameOver();                      // Fin de partie (tout s'eteint)

        // Score et points
        int getRecord();
        int getSequenceLength();
        GameResult calculateResult(bool success);  // Calcule les points

        void resetGame();

    private:
        int record;
        int lastRecord;
        String sequence;
        GameMode currentMode;

        void upRecord();
};

#endif // GAME_H
