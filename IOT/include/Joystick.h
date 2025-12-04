#include <Arduino.h>
#include "config.h"

class Joystick {
    public:
        void begin();
        int getVerticalPosition();
        bool isButtonPressed();
        bool isUpPressed();
        bool isDownPressed();

    private:
        #define DEAD_ZONE_LOW  1500
        #define DEAD_ZONE_HIGH 2600

        int verticalPosition;
        bool buttonState = false;
        bool lastButtonState;
        int lastDirection;
};