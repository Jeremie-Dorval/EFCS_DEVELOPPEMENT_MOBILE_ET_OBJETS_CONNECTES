#include <Arduino.h>
#include "config.h"

class Joystick {
    public:
        void begin();
        int getVerticalPosition();
        bool isButtonPressed();
};