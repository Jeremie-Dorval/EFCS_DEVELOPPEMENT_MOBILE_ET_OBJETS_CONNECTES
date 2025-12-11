#ifndef GAME_H
#define GAME_H

#include <Arduino.h>
#include "config.h"

// Callback pour mise a jour progression en temps reel
typedef void (*ProgressCallback)(int current, int total);

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
        bool playerTurn(ProgressCallback onProgress = nullptr);
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
