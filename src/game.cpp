#include "game.h"
#include "led.h"
#include "button.h"

using namespace std;

LED led;
Button button;

vector<int> Game::sequence = {};

void Game::init() {
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

bool Game::playerTurn() {
  for(int i = 0; i < sequence.size(); i++) {
    int playerColor = -1;

    while(!button.isPressed()) {
      delay(10);
    }

    playerColor = button.getButtonColor();

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

  upRecord();

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

void Game::addLEDSequence() {
    int randLED = led.RandomLED();
    sequence.push_back(randLED);
}

void Game::resetGame() {
    sequence.clear();
}

void Game::upRecord() {
    record++;
}