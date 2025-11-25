#include <Arduino.h>
#include <vector>
#include "config.h"

using namespace std;

class LED {
    public:
        void begin();
        void allOn();
        void ledOn(int led);
        void allOff();
        void ledOff(int led);
        int RandomLED();

    private:
        int color = NONE;
};