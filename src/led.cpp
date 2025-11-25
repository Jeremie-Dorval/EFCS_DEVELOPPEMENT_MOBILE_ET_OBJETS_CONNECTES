#include "led.h"
#include <math.h>
#include <ctime>
#include <cstdlib>

using namespace std;

void LED::begin() {
    pinMode(PIN_LED_BLUE, OUTPUT);
    pinMode(PIN_LED_WHITE, OUTPUT);
    pinMode(PIN_LED_YELLOW, OUTPUT);

    srand(time(nullptr));
}

void LED::allOn() {
    digitalWrite(PIN_LED_BLUE, HIGH);
    digitalWrite(PIN_LED_WHITE, HIGH);
    digitalWrite(PIN_LED_YELLOW, HIGH);
}

void LED::ledOn(int led) {
    if(led == BLUE) {
        digitalWrite(PIN_LED_BLUE, HIGH);
    } 
    else if (led == WHITE) {
        digitalWrite(PIN_LED_WHITE, HIGH);
    }
    else {
        digitalWrite(PIN_LED_YELLOW, HIGH);
    }
}

void LED::allOff() {
    digitalWrite(PIN_LED_BLUE, LOW);
    digitalWrite(PIN_LED_WHITE, LOW);
    digitalWrite(PIN_LED_YELLOW, LOW);
}

void LED::ledOff(int led) {
    if(led == BLUE) {
        digitalWrite(PIN_LED_BLUE, LOW);
    } 
    else if (led == WHITE) {
        digitalWrite(PIN_LED_WHITE, LOW);
    }
    else {
        digitalWrite(PIN_LED_YELLOW, LOW);
    }
}

int LED::RandomLED() {
    int led = (rand() % 3) + 1;

    return led;
}