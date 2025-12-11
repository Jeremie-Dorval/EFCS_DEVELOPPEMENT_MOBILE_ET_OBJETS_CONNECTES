#include "game.h"
#include "led.h"
#include "button.h"

LED led;
Button button;

void Game::init() {
    Serial.println("Initialisation du jeu...");
    led.begin();
    button.begin();
    record = 0;
    lastRecord = 0;
    currentMode = MODE_NORMAL;
    sequence.clear();
}

void Game::setSequence(const String seq) {
    sequence = seq;
    record = 0;  // Reset le score pour nouveau jeu
}

void Game::setMode(GameMode mode) {
    currentMode = mode;
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
    delay(500);  // Pause avant de commencer la sequence
}

// ==================== JOUER SEQUENCE ====================

void Game::playSequence() {
    // Determiner le timing selon le mode
    int onTime, offTime;

    if (currentMode == MODE_EXPERT) {
        onTime = TIMING_EXPERT_ON;
        offTime = TIMING_EXPERT_OFF;
    } else {
        onTime = TIMING_NORMAL_ON;
        offTime = TIMING_NORMAL_OFF;
    }

    // Jouer chaque couleur de la sequence
    for (int i = 0; i < sequence.length(); i++) {
        int color = sequence[i] - '0';  // Convertir char '1','2','3' en int 1,2,3
        led.ledOn(color);
        delay(onTime);
        led.ledOff(color);
        delay(offTime);
    }
}

// ==================== TOUR DU JOUEUR ====================

bool Game::playerTurn() {
    for (int i = 0; i < sequence.length(); i++) {
        int expectedColor = sequence[i] - '0';

        // Attendre qu'un bouton soit presse (avec timeout)
        unsigned long startTime = millis();
        while (!button.isPressed()) {
            if (millis() - startTime > PLAYER_TIMEOUT) {
                return false;  // Timeout - echec
            }
            delay(10);
        }

        // Verifier si la couleur correspond
        if (button.sameColor(expectedColor)) {
            upRecord();
            // Feedback visuel: allumer la LED correspondante
            led.ledOn(expectedColor);
            delay(300);
            led.ledOff(expectedColor);
        } else {
            return false;  // Mauvaise couleur - echec
        }

        // Attendre que le bouton soit relache
        while (button.isPressed()) {
            delay(10);
        }
        delay(100);  // Petit delai entre les pressions
    }

    return true;  // Sequence complete avec succes
}

// ==================== FIN DE PARTIE ====================

void Game::gameOver() {
    // Selon les specifications: tout s'eteint, pas de clignotement
    led.allOff();

    // Mettre a jour le record si necessaire
    if (record > lastRecord) {
        lastRecord = record;
    }
}

// ==================== CALCUL DES POINTS ====================

GameResult Game::calculateResult(bool success) {
    GameResult result;
    result.success = success;
    result.score = record;
    result.sequenceLength = sequence.length();

    int basePoints = sequence.length() * 10;  // 10 points par couleur
    float multiplier = (currentMode == MODE_EXPERT) ? 2.0 : 1.0;
    float completionRatio = (float)record / sequence.length();

    if (success) {
        // Reussite complete: joueur gagne, challenger perd
        result.pointsGagnes = (int)(basePoints * multiplier);
        result.pointsInfliges = (int)(basePoints * multiplier * 0.5);
    } else {
        // Echec: points partiels, challenger peut gagner si echec tot
        float penalty = 1.0 - completionRatio;

        // Points partiels pour les bonnes reponses
        result.pointsGagnes = (int)(record * 5 * multiplier);

        // Si echec tot (< 50%), challenger gagne des points
        // Si echec tard (>= 50%), challenger perd moins de points
        if (completionRatio < 0.5) {
            // Challenger gagne des points (valeur negative = gain pour lui)
            result.pointsInfliges = -(int)(basePoints * penalty * 0.3);
        } else {
            // Challenger perd des points mais moins qu'une reussite complete
            result.pointsInfliges = (int)(basePoints * completionRatio * 0.25);
        }
    }

    return result;
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
