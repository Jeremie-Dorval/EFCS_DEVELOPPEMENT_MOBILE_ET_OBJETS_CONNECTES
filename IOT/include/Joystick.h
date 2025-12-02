#include <Arduino.h>
#include "config.h"

class Joystick {
    public:
        void begin();
        void update();
        int getVerticalPosition();
        bool isButtonPressed();
        bool isUpPressed();
        bool isDownPressed();

    private:
        const int threshold = 100; // Seuil pour détecter le mouvement
        int verticalPosition;
        int buttonState;
};