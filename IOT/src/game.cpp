#include "game.h"
#include "led.h"
#include "button.h"
#include "LCD.h"

using namespace std;

LED led;
Button button;

void Game::init() {
  Serial.println("Initialisation du jeu...");
  led.begin();
  button.begin();
  record = 0;
  lastRecord = 0;
  sequence.clear();
}

void Game::playSequence() {
  for (int color : sequence) {
    led.ledOn(color);
    delay(500);
    led.ledOff(color);
    delay(200);
  }
}

void Game::setSequence(const String seq) {
    sequence = seq;
}

bool Game::playerTurn() {
  for(int i = 0; i < sequence.length(); i++) {

    while(!button.isPressed()) {
      delay(10);
    }

    if(button.isPressed()) {
      if(button.sameColor(sequence[i])) {
        upRecord();
        led.ledOn(sequence[i]);
        delay(500);
        led.ledOff(sequence[i]);
      }
      else {
        return false;
      }
    }

    while(button.isPressed()) {
      delay(10);
    }
  }

  return true;
}

void Game::gameOver() {
    int nb = 3;

    if(record > lastRecord)
    {
        nb = 4;
        lastRecord = record;
    }
    
    for(int i = 0; i < nb; i++) {
        led.allOn();
        delay(150);
        led.allOff();
        delay(150);
    }

    record = 0;
}

void Game::resetGame() {
    sequence.clear();
}

void Game::upRecord() {
    record++;
}

int Game::getRecord() {
    return record;
}