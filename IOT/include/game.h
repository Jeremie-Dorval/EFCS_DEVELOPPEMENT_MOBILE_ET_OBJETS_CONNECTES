#ifndef GAME_H
#define GAME_H

#include <Arduino.h>
#include "config.h"

class Game {
    public:
        void init();

        // Sequence et difficulte
        void setSequence(const String seq);
        void setMode(GameMode mode);
        void setDifficulty(int diff);
        int getDifficulty();

        // Gameplay
        void blinkStart();
        void playSequence();
        bool playerTurn();
        void gameOver();

        // Score et points
        int getRecord();
        int getSequenceLength();
        GameResult calculateResult(bool success);

        void resetGame();

    private:
        int record;
        int lastRecord;
        String sequence;
        GameMode currentMode;
        int difficulty;  // 1-10, utilise pour timing et calcul points

        void upRecord();
};

#endif
