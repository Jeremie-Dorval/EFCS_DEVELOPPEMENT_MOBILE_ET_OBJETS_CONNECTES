#include "Joystick.h"

#define DEAD_ZONE_LOW  1500
#define DEAD_ZONE_HIGH 2600

void Joystick::begin() {
    Serial.println("Initialisation du joystick...");
    pinMode(JOY_Y, INPUT);
    pinMode(JOY_BTN, INPUT_PULLUP);

    lastButtonState = HIGH;
    lastDirection = 0;
}

int Joystick::getVerticalPosition() {
    return analogRead(JOY_Y); // 0 (haut) → max (bas)
}

bool Joystick::isButtonPressed() {
    bool currentState = digitalRead(JOY_BTN);
    bool clicked = false;

    if (currentState == LOW && lastButtonState == HIGH) {
        clicked = true;
    }

    lastButtonState = currentState;
    return clicked;
}

bool Joystick::isUpPressed() {
    if (getVerticalPosition() < DEAD_ZONE_LOW && lastDirection != -1) {
        lastDirection = -1;
        return true;
    }

    if (getVerticalPosition() >= DEAD_ZONE_LOW && getVerticalPosition() <= DEAD_ZONE_HIGH) {
        lastDirection = 1;
        return false;
    }
    return false;
}

bool Joystick::isDownPressed() {
    if (getVerticalPosition() > DEAD_ZONE_HIGH && lastDirection != 1) {
        lastDirection = 1;
        return true;
    }

    if (getVerticalPosition() >= DEAD_ZONE_LOW && getVerticalPosition() <= DEAD_ZONE_HIGH) {
        lastDirection = 0;
        return false;
    }
    
    return false;
}