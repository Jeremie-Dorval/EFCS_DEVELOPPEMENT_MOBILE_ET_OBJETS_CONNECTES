#include "game.h"
#include "led.h"
#include "button.h"
#include "PointCalculator.h"

LED led;
Button button;

void Game::init() {
    Serial.println("Initialisation du jeu...");
    led.begin();
    button.begin();
    record = 0;
    lastRecord = 0;
    currentMode = MODE_NORMAL;
    difficulty = 5;  // Difficulte par defaut
    sequence.clear();
}

void Game::setSequence(const String seq) {
    sequence = seq;
    record = 0; 
}

void Game::setMode(GameMode mode) {
    currentMode = mode;
}

void Game::setDifficulty(int diff) {
    difficulty = constrain(diff, 1, 10);
    Serial.print("Difficulte definie: "); Serial.println(difficulty);
}

int Game::getDifficulty() {
    return difficulty;
}

// ==================== CLIGNOTEMENT DEBUT ====================

void Game::blinkStart() {
    // 3 clignotements pour annoncer le debut de la sequence
    for (int i = 0; i < 3; i++) {
        led.allOn();
        delay(TIMING_BLINK);
        led.allOff();
        delay(TIMING_BLINK);
    }
    delay(500);
}

// ==================== JOUER SEQUENCE ====================

void Game::playSequence() {
    // diff 1 = lent (500ms ON, 300ms OFF)
    // diff 10 = rapide (200ms ON, 100ms OFF)
    int onTime = map(difficulty, 1, 10, 500, 200);
    int offTime = map(difficulty, 1, 10, 300, 100);

    Serial.print("Timing - ON: "); Serial.print(onTime);
    Serial.print("ms, OFF: "); Serial.print(offTime); Serial.println("ms");

    // Jouer chaque couleur de la sequence
    for (int i = 0; i < sequence.length(); i++) {
        int color = sequence[i] - '0';
        led.ledOn(color);
        delay(onTime);
        led.ledOff(color);
        delay(offTime);
    }
}

// ==================== TOUR DU JOUEUR ====================

bool Game::playerTurn(ProgressCallback onProgress) {
    for (int i = 0; i < sequence.length(); i++) {
        int expectedColor = sequence[i] - '0';
        // Attendre que le joueur appuie sur un bouton ou timeout
        unsigned long startTime = millis();
        while (!button.isPressed()) {
            if (millis() - startTime > PLAYER_TIMEOUT) {
                return false;
            }
            delay(10);
        }

        if (button.sameColor(expectedColor)) {
            upRecord();
            led.ledOn(expectedColor);
            delay(300);
            led.ledOff(expectedColor);

            // Mise a jour progression en temps reel
            if (onProgress != nullptr) {
                onProgress(record, sequence.length());
            }
        } else {
            return false;
        }

        // Attendre que le bouton soit relache
        while (button.isPressed()) {
            delay(10); //debouncing
        }
        delay(100);
    }

    return true;
}

// ==================== FIN DE PARTIE ====================

void Game::gameOver() {
    led.allOff();

    if (record > lastRecord) {
        lastRecord = record;
    }
}

GameResult Game::calculateResult(bool success) {
    return PointCalculator::calculate(record, sequence.length(), difficulty);
}

// ==================== ACCESSEURS ====================

void Game::resetGame() {
    sequence.clear();
    record = 0;
}

void Game::upRecord() {
    record++;
}

int Game::getRecord() {
    return record;
}

int Game::getSequenceLength() {
    return sequence.length();
}
