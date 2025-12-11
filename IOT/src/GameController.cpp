/**
 * GameController.cpp
 * Controleur principal - gere la machine a etats du jeu
 * Flow: MENU -> DIFFICULTY_SELECT -> PLAYING -> GAME_OVER -> MENU
 */

#include "GameController.h"

// Pointeur statique pour le callback (necessaire car playerTurn() attend un pointeur de fonction)
LCD* GameController::lcdPtr = nullptr;

// Callback appele apres chaque input correct pour mettre a jour la barre de progression (aider de claude code, prompt: peux tu m'aider a ecrire une fonction C++ qui met a jour une barre de progression sur un ecran LCD en temps réel?)
void progressCallback(int current, int total) {
    if (GameController::lcdPtr != nullptr) {
        GameController::lcdPtr->updateProgress(current, total);
    }
}

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

// Charge les defis depuis Firebase et initialise le menu
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
    lastRefreshTime = millis();
    return true;
}

// Boucle principale - appele dans loop(), dispatche selon l'etat courant
void GameController::update() {
    if (loadError) {
        delay(1000);
        return;
    }

    switch (currentState) {
        case STATE_MENU:
            handleMenuState();
            break;
        case STATE_DIFFICULTY_SELECT:
            handleDifficultySelectState();
            break;
        case STATE_PLAYING:
            handlePlayingState();
            break;
        case STATE_GAME_OVER:
            handleGameOverState();
            break;
    }
}

// STATE_MENU: Navigation dans la liste des defis + auto-refresh
void GameController::handleMenuState() {
    // Auto-refresh toutes les 30 secondes
    if (millis() - lastRefreshTime > REFRESH_INTERVAL) {
        refreshChallenges();
        lastRefreshTime = millis();
    }

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

            // Aller vers l'ecran de selection de difficulte
            lcd.drawDifficultySelect(
                currentChallenger,
                challenges[selected].sequence.length(),
                difficulties[selected],  // Difficulte mobile comme valeur initiale
                difficulties[selected]   // Affichage de reference
            );
            currentState = STATE_DIFFICULTY_SELECT;
        }
    }
}

// STATE_DIFFICULTY_SELECT: Choix de la difficulte 1-10 avec joystick
void GameController::handleDifficultySelectState() {
    if (joystick.isUpPressed()) lcd.moveDifficultyUp();
    if (joystick.isDownPressed()) lcd.moveDifficultyDown();

    if (joystick.isButtonPressed()) {
        int selected = lcd.getSelectedItem();
        int selectedDifficulty = lcd.getSelectedDifficulty();

        game.setSequence(challenges[selected].sequence);
        game.setDifficulty(selectedDifficulty);

        Serial.print("Lancement avec difficulte: "); Serial.println(selectedDifficulty);

        lcd.drawGamePlaying(currentChallenger, challenges[selected].sequence.length(), selectedDifficulty);
        currentState = STATE_PLAYING;
        runGame();
    }
}

// Execute la partie: clignotement -> sequence -> tour joueur -> sauvegarde resultat
void GameController::runGame() {
    // Configurer le pointeur statique pour le callback
    lcdPtr = &lcd;

    Serial.println("Debut du defi - Clignotement");
    game.blinkStart();

    Serial.println("Lecture de la sequence");
    game.playSequence();

    Serial.println("Tour du joueur");
    lcd.updateProgress(0, game.getSequenceLength());

    // Passer le callback pour mise a jour temps reel
    bool success = game.playerTurn(progressCallback);
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

// STATE_GAME_OVER: Affiche resultat, clic pour retourner au menu
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
        lastRefreshTime = millis();
    }
}

// ==================== REFRESH TEMPS REEL ====================

// Recharge les defis depuis Firebase sans redemarrer l'ESP32
void GameController::refreshChallenges() {
    Serial.println("Refresh des defis...");

    FirestoreChallenge newChallenges[MENU_SIZE];

    if (challengeManager.loadChallenges(playerId)) {
        for (int i = 0; i < MENU_SIZE; i++) {
            newChallenges[i] = challengeManager.getChallenge(i);
        }

        if (hasChallengesChanged(newChallenges)) {
            Serial.println("Nouveaux defis detectes!");

            for (int i = 0; i < MENU_SIZE; i++) {
                challenges[i] = newChallenges[i];
                if (challenges[i].challenger != "") {
                    difficulties[i] = challengeRepo.getDifficulty(playerId, challenges[i].index);
                }
            }

            lcd.createMenuItems(challenges);
            lcd.drawMenu();
        } else {
            Serial.println("Aucun changement.");
        }
    } else {
        Serial.println("Echec du refresh.");
    }
}

// Compare les defis pour detecter si mise a jour necessaire
bool GameController::hasChallengesChanged(FirestoreChallenge newChallenges[MENU_SIZE]) {
    for (int i = 0; i < MENU_SIZE; i++) {
        if (challenges[i].challenger != newChallenges[i].challenger ||
            challenges[i].sequence != newChallenges[i].sequence ||
            challenges[i].index != newChallenges[i].index) {
            return true;
        }
    }
    return false;
}
