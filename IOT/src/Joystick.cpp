#include "Joystick.h"

// DEAD_ZONE_LOW et DEAD_ZONE_HIGH définis dans Joystick.h

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
    bool pressed = false;

    // Détection de front descendant (HIGH → LOW)
    if (currentState == LOW && lastButtonState == HIGH) {
        delay(50);  // Debounce
        if (digitalRead(JOY_BTN) == LOW) {
            pressed = true;
        }
    }

    lastButtonState = currentState;
    return pressed;
}

bool Joystick::isUpPressed() {
    int pos = getVerticalPosition();

    if (pos < DEAD_ZONE_LOW && lastDirection != -1) {
        lastDirection = -1;
        delay(50);
        return true;
    }

    if (pos >= DEAD_ZONE_LOW && pos <= DEAD_ZONE_HIGH) {
        lastDirection = 0;
    }
    return false;
}

bool Joystick::isDownPressed() {
    int pos = getVerticalPosition();

    if (pos > DEAD_ZONE_HIGH && lastDirection != 1) {
        lastDirection = 1;
        delay(50);
        return true;
    }

    if (pos >= DEAD_ZONE_LOW && pos <= DEAD_ZONE_HIGH) {
        lastDirection = 0;
    }
    return false;
}