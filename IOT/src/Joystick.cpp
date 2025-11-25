#include "Joystick.h"
#include <Arduino.h>

void Joystick::begin() {
    pinMode(JOY_BTN, INPUT_PULLUP);
}

int Joystick::getHorizontalPosition() {
    return analogRead(JOY_X); // 0 (gauche) → max (droite)
}

int Joystick::getVerticalPosition() {
    return analogRead(JOY_Y); // 0 (haut) → max (bas)
}

bool Joystick::isButtonPressed() {
    return digitalRead(JOY_BTN); // LOW si appuyé, HIGH si relâché
}
