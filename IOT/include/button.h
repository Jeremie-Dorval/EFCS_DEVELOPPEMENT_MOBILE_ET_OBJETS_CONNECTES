#include <Arduino.h>
#include "config.h"

class Button {
    public:
        void begin();
        void setButtonColor(int color);
        int getButtonColor();
        bool isPressed();
        bool sameColor(int led);

    private:
        int buttonColor = NONE;
        bool _buttonState;
        unsigned long _pressStartTime;
};