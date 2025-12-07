#include "button.h"

void Button::begin() {
    pinMode(PIN_BT_GREEN, INPUT_PULLUP);
    pinMode(PIN_BT_WHITE, INPUT_PULLUP);
    pinMode(PIN_BT_RED, INPUT_PULLUP);
}

void Button::setButtonColor(int color) {
    buttonColor = color;
}

int Button::getButtonColor() {
    return buttonColor;
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

// Fonction effectOnPress supprimée - logique de debounce déjà gérée dans isPressed()

bool Button::sameColor(int led) {
    if(buttonColor == led)
    {
        return true;
    }

    return false;
}