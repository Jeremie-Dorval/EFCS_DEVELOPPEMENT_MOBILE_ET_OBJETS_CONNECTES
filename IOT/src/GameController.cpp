#include "GameController.h"

GameController::GameController(Game& game, LCD& lcd, Joystick& joystick,
                               FirestoreChallenges& challengeManager,
                               ChallengeRepository& challengeRepo,
                               UserRepository& userRepo)
    : game(game), lcd(lcd), joystick(joystick),
      challengeManager(challengeManager),
      challengeRepo(challengeRepo), userRepo(userRepo),
      currentState(STATE_MENU), loadError(false) {

    for (int i = 0; i < MENU_SIZE; i++) {
        difficulties[i] = 5;
    }
}

bool GameController::loadChallenges(const String& pid) {
    playerId = pid;

    if (!challengeManager.loadChallenges(playerId)) {
        Serial.println("Echec du chargement des defis.");
        lcd.clear();
        lcd.print("Erreur chargement!", 10, 100);
        loadError = true;
        return false;
    }

    challengeManager.printAll();

    for (int i = 0; i < MENU_SIZE; i++) {
        challenges[i] = challengeManager.getChallenge(i);
        if (challenges[i].challenger != "") {
            difficulties[i] = challengeRepo.getDifficulty(playerId, challenges[i].index);
            Serial.print("Defi "); Serial.print(i);
            Serial.print(" - Difficulte: "); Serial.println(difficulties[i]);
        }
    }

    lcd.createMenuItems(challenges);
    lcd.drawMenu();
    currentState = STATE_MENU;
    return true;
}

void GameController::update() {
    if (loadError) {
        delay(1000);
        return;
    }

    switch (currentState) {
        case STATE_MENU:
            handleMenuState();
            break;
        case STATE_MODE_SELECT:
            handleModeSelectState();
            break;
        case STATE_PLAYING:
            handlePlayingState();
            break;
        case STATE_GAME_OVER:
            handleGameOverState();
            break;
    }
}

void GameController::handleMenuState() {
    if (joystick.isUpPressed()) {
        lcd.moveCursorUp();
    }
    if (joystick.isDownPressed()) {
        lcd.moveCursorDown();
    }

    if (joystick.isButtonPressed()) {
        int selected = lcd.getSelectedItem();
        Serial.print("Defi selectionne: "); Serial.println(selected);

        if (selected >= 0 && selected < MENU_SIZE && challenges[selected].challenger != "") {
            currentChallenger = challenges[selected].challenger;

            game.setSequence(challenges[selected].sequence);
            game.setDifficulty(difficulties[selected]);

            Serial.print("Lancement avec difficulte: "); Serial.println(difficulties[selected]);

            lcd.drawGamePlaying(currentChallenger, challenges[selected].sequence.length(), difficulties[selected]);
            currentState = STATE_PLAYING;

            runGame();
        }
    }
}

void GameController::handleModeSelectState() {
    if (joystick.isUpPressed()) lcd.moveModeUp();
    if (joystick.isDownPressed()) lcd.moveModeDown();

    if (joystick.isButtonPressed()) {
        int selected = lcd.getSelectedItem();
        GameMode selectedMode = lcd.getSelectedMode();

        game.setSequence(challenges[selected].sequence);
        game.setMode(selectedMode);

        lcd.drawGamePlaying(currentChallenger, challenges[selected].sequence.length(), difficulties[selected]);
        currentState = STATE_PLAYING;
        runGame();
    }
}

void GameController::runGame() {
    Serial.println("Debut du defi - Clignotement");
    game.blinkStart();

    Serial.println("Lecture de la sequence");
    game.playSequence();

    Serial.println("Tour du joueur");
    lcd.updateProgress(0, game.getSequenceLength());

    bool success = game.playerTurn();
    game.gameOver();
    lastResult = game.calculateResult(success);

    Serial.print("Resultat: "); Serial.println(success ? "REUSSI" : "ECHOUE");
    Serial.print("Score: "); Serial.print(lastResult.score);
    Serial.print("/"); Serial.println(lastResult.sequenceLength);

    int selected = lcd.getSelectedItem();
    if (selected >= 0 && selected < MENU_SIZE) {
        challengeRepo.completeChallenge(
            playerId,
            challenges[selected].index,
            lastResult.pointsGagnes,
            lastResult.score,
            lastResult.sequenceLength,
            lastResult.pointsInfliges
        );

        userRepo.updatePoints(playerId, lastResult.pointsGagnes);
        userRepo.updatePoints(challenges[selected].challenger, lastResult.pointsInfliges);
    }

    lcd.drawGameOver(lastResult, currentChallenger);
    currentState = STATE_GAME_OVER;
}

void GameController::handlePlayingState() {
    // Gere par runGame() qui bloque l'execution
}

void GameController::handleGameOverState() {
    if (joystick.isButtonPressed()) {
        Serial.println("Retour au menu");
        lcd.clear();
        lcd.print("Chargement...", 100, 110);

        if (challengeManager.loadChallenges(playerId)) {
            for (int i = 0; i < MENU_SIZE; i++) {
                challenges[i] = challengeManager.getChallenge(i);
                if (challenges[i].challenger != "") {
                    difficulties[i] = challengeRepo.getDifficulty(playerId, challenges[i].index);
                }
            }
            lcd.createMenuItems(challenges);
        }

        lcd.returnToMenu();
        currentState = STATE_MENU;
    }
}
