#include <Arduino.h>
#include <vector>
#include "config.h"

using namespace std;

class Game {
    public:
        void init();
        void playSequence();
        bool playerTurn();
        void gameOver();
        void addLEDSequence();
        void resetGame();

    private:
        int record;
        int lastRecord;
        static vector<int> sequence;

        void upRecord();
};