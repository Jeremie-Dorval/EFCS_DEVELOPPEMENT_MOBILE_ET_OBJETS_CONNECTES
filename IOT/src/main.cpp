#include <Arduino.h>
#include <WiFi.h>
#include <FirestoreChallenges/FirestoreChallenges.h>
#include "game.h"
#include "manageFirebase.h"
#include "LCD.h"
#include "joystick.h"

using namespace std;

Game game;
ManageFirebase firebase;
LCD lcd;
Joystick joystick;
FirestoreChallenges challengeManager(&firebase.getFirebaseData(), FIREBASE_PROJECT_ID);
FirestoreChallenge challenge[MENU_SIZE];

bool inGame = false;

void setup() {
  Serial.begin(9600);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while(WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println("WiFi connecté");

  firebase.connexion();

  lcd.begin();
  joystick.begin();
  game.init();

  lcd.clear();

  Serial.println("Chargement des défis...");
  if(challengeManager.loadChallenges("123456")) {
    challengeManager.printAll();

    for (int i = 0; i < MENU_SIZE; i++) {
      challenge[i] = challengeManager.getChallenge(i);
    }
    lcd.createMenuItems(challenge);
    lcd.drawMenu();
  } else {
    Serial.println("Échec du chargement des défis.");
    lcd.print("Erreur de chargement", 10, 10);
  }
}

void loop() {
  if (!inGame) {

    if (joystick.isUpPressed()) {
      lcd.moveCursorUp();
    }

    if (joystick.isDownPressed()) {
      lcd.moveCursorDown();
    }

    if (joystick.isButtonPressed()) {
      int selected = lcd.getSelectedItem();

      if (selected >= 0 && selected < MENU_SIZE) {
        lcd.openSelectedItem();

        game.setSequence(lcd.getMenuItems()[selected].sequence);
        inGame = true;
      }
    }

  }
  else {

    game.playSequence();

    if (!game.playerTurn()) {
      game.gameOver();

      lcd.clear();
      lcd.print("Échec!", 10, 10);
      delay(1000);
    } 
    else {
      lcd.clear();
      lcd.print("Succès!", 10, 10);
      delay(1000);

      challengeManager.updatePoints(
        lcd.getSelectedItem(),
        game.getRecord()
      );
    }

    lcd.closeCurrentItem();
    inGame = false;
  }
}
