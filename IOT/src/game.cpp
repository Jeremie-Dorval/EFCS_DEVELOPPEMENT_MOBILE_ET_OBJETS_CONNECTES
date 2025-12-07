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
  for (int i = 0; i < sequence.length(); i++) {
    int color = sequence[i] - '0';  // Convertir char '1','2','3' en int 1,2,3
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
  const unsigned long TIMEOUT = 10000;  // 10 secondes de timeout

  for(int i = 0; i < sequence.length(); i++) {
    int expectedColor = sequence[i] - '0';  // Convertir char en int

    // Attendre qu'un bouton soit pressé (avec timeout)
    unsigned long startTime = millis();
    while(!button.isPressed()) {
      if (millis() - startTime > TIMEOUT) {
        return false;  // Timeout - échec
      }
      delay(10);
    }

    // Vérifier si la couleur correspond (button.isPressed() a déjà enregistré la couleur)
    if(button.sameColor(expectedColor)) {
      upRecord();
      led.ledOn(expectedColor);
      delay(500);
      led.ledOff(expectedColor);
    }
    else {
      return false;
    }

    // Attendre que le bouton soit relâché
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