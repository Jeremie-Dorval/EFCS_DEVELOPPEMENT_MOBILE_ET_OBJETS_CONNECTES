#include "Joystick.h"

void Joystick::begin() {
    pinMode(JOY_BTN, INPUT_PULLUP);
}

int Joystick::getVerticalPosition() {
    return analogRead(JOY_Y); // 0 (haut) → max (bas)
}

bool Joystick::isButtonPressed() {
    return digitalRead(JOY_BTN); // LOW si appuyé, HIGH si relâché
}
