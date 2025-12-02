#include "Joystick.h"

void Joystick::begin() {
    pinMode(JOY_BTN, INPUT_PULLUP);
}

void Joystick::update() {
    buttonState = digitalRead(JOY_BTN);
    verticalPosition = analogRead(JOY_Y);
}

int Joystick::getVerticalPosition() {
    return analogRead(JOY_Y); // 0 (haut) → max (bas)
}

bool Joystick::isButtonPressed() {
    return digitalRead(JOY_BTN) == LOW; // LOW si appuyé, HIGH si relâché
}

bool Joystick::isUpPressed() {
    verticalPosition = getVerticalPosition();
    return verticalPosition < (512 - threshold); // Seuil pour détecter le mouvement vers le haut
}

bool Joystick::isDownPressed() {
    verticalPosition = getVerticalPosition();
    return verticalPosition > (512 + threshold); // Seuil pour détecter le mouvement vers le bas
}