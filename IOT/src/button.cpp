#include "button.h"

void Button::begin() {
    pinMode(PIN_BT_GREEN, INPUT_PULLUP);
    pinMode(PIN_BT_WHITE, INPUT_PULLUP);
    pinMode(PIN_BT_RED, INPUT_PULLUP);
}

void Button::setButtonColor(int color) {
    buttonCollor = color;
}

int Button::getButtonColor() {
    return buttonCollor;
}

bool Button::isPressed() {
    if(digitalRead(PIN_BT_GREEN) == LOW) {
        setButtonColor(GREEN);
        _pressStartTime = millis();
        delay(50); // small delay for debounce
        if(digitalRead(PIN_BT_GREEN) == LOW) {
            return true;
        }
    }
    else if(digitalRead(PIN_BT_WHITE) == LOW) {
        setButtonColor(WHITE);
        _pressStartTime = millis();
        delay(50); // small delay for debounce
        if(digitalRead(PIN_BT_WHITE) == LOW) {
            return true;
        }
    }
    else if(digitalRead(PIN_BT_RED) == LOW) {
        setButtonColor(RED);
        _pressStartTime = millis();
        delay(50); // small delay for debounce
        if(digitalRead(PIN_BT_RED) == LOW) {
            return true;
        }
    }

    return false;
}

void Button::effectOnPress(int led) {
    if(isPressed()) {
        unsigned long currentTime = millis();

        if(currentTime - _lastPressTime > DEBOUNCE_DELAY) {
            _lastPressTime = currentTime;
        }
    }
}

bool Button::sameColor(int led) {
    if(buttonCollor == led)
    {
        return true;
    }

    return false;
}