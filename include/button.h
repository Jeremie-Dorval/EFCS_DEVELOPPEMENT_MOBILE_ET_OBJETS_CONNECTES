#include <Arduino.h>
#include "config.h"

class Button {
    public:
        void begin();
        void setButtonColor(int color);
        int getButtonColor();
        bool isPressed();
        void effectOnPress(int led);
        bool sameColor(int led);

    private:
        int buttonCollor = NONE;
        bool _buttonState;
        unsigned long _lastPressTime;
        unsigned long _pressStartTime;
        const unsigned long DEBOUNCE_DELAY = 50; // milliseconds
};