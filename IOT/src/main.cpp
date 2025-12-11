#include <Arduino.h>
#include <WiFi.h>
#include <FirestoreChallenges/FirestoreChallenges.h>
#include "game.h"
#include "manageFirebase.h"
#include "LCD.h"
#include "Joystick.h"

// ==================== OBJETS GLOBAUX ====================

Game game;
ManageFirebase firebase;
LCD lcd;
Joystick joystick;
FirestoreChallenges challengeManager(&firebase.getFirebaseData(), FIREBASE_PROJECT_ID);
FirestoreChallenge challenges[MENU_SIZE];

// ==================== VARIABLES D'ETAT ====================

GameState currentState = STATE_MENU;
GameResult lastResult;
String currentChallenger = "";
bool loadError = false;

// ==================== PROTOTYPES ====================

void handleMenuState();
void handleModeSelectState();
void handlePlayingState();
void handleGameOverState();
void runGame();

// ==================== SETUP ====================

void setup() {
    Serial.begin(9600);

    // Initialiser l'ecran en premier pour afficher les messages
    lcd.begin();
    lcd.clear();
    lcd.print("Connexion WiFi...", 10, 100);

    // Connexion WiFi
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    int wifiAttempts = 0;
    while (WiFi.status() != WL_CONNECTED && wifiAttempts < 30) {
        Serial.print(".");
        delay(500);
        wifiAttempts++;
    }

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Echec WiFi!");
        lcd.clear();
        lcd.print("Erreur WiFi!", 10, 100);
        lcd.print("Verifiez le reseau", 10, 130);
        loadError = true;
        return;
    }

    Serial.println("WiFi connecte");
    lcd.clear();
    lcd.print("WiFi OK!", 10, 100);
    delay(500);

    // Connexion Firebase
    lcd.clear();
    lcd.print("Connexion Firebase...", 10, 100);
    firebase.connexion();

    // Initialiser les composants
    joystick.begin();
    game.init();

    // Charger les defis
    lcd.clear();
    lcd.print("Chargement defis...", 10, 100);
    Serial.println("Chargement des defis...");

    if (challengeManager.loadChallenges("jgbWbzLttoS6TAf9K4q95TBQd4v2")) {
        challengeManager.printAll();

        for (int i = 0; i < MENU_SIZE; i++) {
            challenges[i] = challengeManager.getChallenge(i);
        }
        lcd.createMenuItems(challenges);
        lcd.drawMenu();
        currentState = STATE_MENU;
    } else {
        Serial.println("Echec du chargement des defis.");
        lcd.clear();
        lcd.print("Erreur chargement!", 10, 100);
        lcd.print("Redemarrez", 10, 130);
        loadError = true;
    }
}

// ==================== LOOP ====================

void loop() {
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

    delay(10);
}

// ==================== ETATS ====================

void handleMenuState() {
    // Navigation dans le menu
    if (joystick.isUpPressed()) {
        lcd.moveCursorUp();
    }

    if (joystick.isDownPressed()) {
        lcd.moveCursorDown();
    }

    // Selection d'un defi
    if (joystick.isButtonPressed()) {
        int selected = lcd.getSelectedItem();
        Serial.print("Defi selectionne: ");
        Serial.println(selected);

        if (selected >= 0 && selected < MENU_SIZE && challenges[selected].challenger != "") {
            currentChallenger = challenges[selected].challenger;
            lcd.drawModeSelect(currentChallenger, challenges[selected].sequence.length());
            currentState = STATE_MODE_SELECT;
        }
    }
}

void handleModeSelectState() {
    // Navigation entre Normal et Expert
    if (joystick.isUpPressed()) {
        lcd.moveModeUp();
    }

    if (joystick.isDownPressed()) {
        lcd.moveModeDown();
    }

    // Lancer le jeu
    if (joystick.isButtonPressed()) {
        int selected = lcd.getSelectedItem();
        GameMode selectedMode = lcd.getSelectedMode();

        Serial.print("Mode selectionne: ");
        Serial.println(selectedMode == MODE_EXPERT ? "EXPERT" : "NORMAL");

        // Configurer le jeu
        game.setSequence(challenges[selected].sequence);
        game.setMode(selectedMode);

        // Afficher l'ecran de jeu
        lcd.drawGamePlaying(currentChallenger, challenges[selected].sequence.length(), selectedMode);

        currentState = STATE_PLAYING;

        // Lancer le jeu (cette partie est bloquante)
        runGame();
    }
}

void runGame() {
    // 1. Clignotement 3x pour annoncer le debut
    Serial.println("Debut du defi - Clignotement");
    game.blinkStart();

    // 2. Jouer la sequence
    Serial.println("Lecture de la sequence");
    game.playSequence();

    // 3. Tour du joueur
    Serial.println("Tour du joueur");
    lcd.updateProgress(0, game.getSequenceLength());

    bool success = game.playerTurn();

    // 4. Fin de partie
    game.gameOver();

    // 5. Calculer les resultats
    lastResult = game.calculateResult(success);

    Serial.print("Resultat: ");
    Serial.println(success ? "REUSSI" : "ECHOUE");
    Serial.print("Score: ");
    Serial.print(lastResult.score);
    Serial.print("/");
    Serial.println(lastResult.sequenceLength);
    Serial.print("Points gagnes: ");
    Serial.println(lastResult.pointsGagnes);
    Serial.print("Points infliges: ");
    Serial.println(lastResult.pointsInfliges);

    // 6. Mettre a jour Firebase
    int selected = lcd.getSelectedItem();
    if (selected >= 0 && selected < MENU_SIZE) {
        challengeManager.updatePoints(selected, lastResult.pointsGagnes);
    }

    // 7. Afficher l'ecran de fin
    lcd.drawGameOver(lastResult, currentChallenger);
    currentState = STATE_GAME_OVER;
}

void handlePlayingState() {
    // Cet etat est gere par runGame() qui est bloquant
    // On ne devrait pas arriver ici
}

void handleGameOverState() {
    // Attendre un clic pour retourner au menu
    if (joystick.isButtonPressed()) {
        Serial.println("Retour au menu");

        // Recharger les defis pour avoir la liste a jour
        lcd.clear();
        lcd.print("Chargement...", 100, 110);

        if (challengeManager.loadChallenges("jgbWbzLttoS6TAf9K4q95TBQd4v2")) {
            for (int i = 0; i < MENU_SIZE; i++) {
                challenges[i] = challengeManager.getChallenge(i);
            }
            lcd.createMenuItems(challenges);
        }

        lcd.returnToMenu();
        currentState = STATE_MENU;
    }
}
