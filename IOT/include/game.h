#include <Arduino.h>
#include <vector>
#include "config.h"

using namespace std;

class Game {
    public:
        void init();
        void playSequence();
        void setSequence(const String seq);
        bool playerTurn();
        void gameOver();
        void resetGame();
        int getRecord();

    private:
        int record;
        int lastRecord;
        String sequence;

        void upRecord();
};