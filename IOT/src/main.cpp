#include <Arduino.h>
#include <WiFi.h>
#include <FirestoreChallenges/FirestoreChallenges.h>
#include "game.h"
#include "LCD.h"
#include "Joystick.h"
#include "FirebaseConnection.h"
#include "ChallengeRepository.h"
#include "UserRepository.h"
#include "GameController.h"

// Objets globaux
Game game;
LCD lcd;
Joystick joystick;
FirebaseConnection firebase;
ChallengeRepository challengeRepo(firebase);
UserRepository userRepo(firebase);
FirestoreChallenges challengeManager(&firebase.getData(), FIREBASE_PROJECT_ID);
GameController* controller;

String playerId = "jgbWbzLttoS6TAf9K4q95TBQd4v2";
bool loadError = false;

void setup() {
    Serial.begin(9600);

    lcd.begin();
    lcd.clear();
    lcd.print("Connexion WiFi...", 10, 100);

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
        loadError = true;
        return;
    }

    Serial.println("WiFi connecte");
    lcd.clear();
    lcd.print("WiFi OK!", 10, 100);
    delay(500);

    lcd.clear();
    lcd.print("Connexion Firebase...", 10, 100);
    firebase.connect();

    joystick.begin();
    game.init();

    controller = new GameController(game, lcd, joystick, challengeManager, challengeRepo, userRepo);

    lcd.clear();
    lcd.print("Chargement defis...", 10, 100);
    Serial.println("Chargement des defis...");

    if (!controller->loadChallenges(playerId)) {
        lcd.print("Redemarrez", 10, 130);
        loadError = true;
    }
}

void loop() {
    if (loadError) {
        delay(1000);
        return;
    }

    controller->update();
    delay(10);
}
