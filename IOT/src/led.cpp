#include "led.h"
#include <math.h>
#include <ctime>
#include <cstdlib>

using namespace std;

void LED::begin() {
    pinMode(PIN_LED_GREEN, OUTPUT);
    pinMode(PIN_LED_WHITE, OUTPUT);
    pinMode(PIN_LED_RED, OUTPUT);

    srand(time(nullptr));
}

void LED::allOn() {
    digitalWrite(PIN_LED_GREEN, HIGH);
    digitalWrite(PIN_LED_WHITE, HIGH);
    digitalWrite(PIN_LED_RED, HIGH);
}

void LED::ledOn(int led) {
    if(led == GREEN) {
        digitalWrite(PIN_LED_GREEN, HIGH);
    } 
    else if (led == WHITE) {
        digitalWrite(PIN_LED_WHITE, HIGH);
    }
    else {
        digitalWrite(PIN_LED_RED, HIGH);
    }
}

void LED::allOff() {
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_WHITE, LOW);
    digitalWrite(PIN_LED_RED, LOW);
}

void LED::ledOff(int led) {
    if(led == GREEN) {
        digitalWrite(PIN_LED_GREEN, LOW);
    } 
    else if (led == WHITE) {
        digitalWrite(PIN_LED_WHITE, LOW);
    }
    else {
        digitalWrite(PIN_LED_RED, LOW);
    }
}

int LED::RandomLED() {
    int led = (rand() % 3) + 1;

    return led;
}