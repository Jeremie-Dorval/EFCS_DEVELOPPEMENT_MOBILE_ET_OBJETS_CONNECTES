#include <Arduino.h>
#include <WiFi.h>
#include <FirestoreChallenges/FirestoreChallenges.h>
#include "game.h"
#include "manageFirebase.h"
#include "LCD.h"

using namespace std;

Game game;
ManageFirebase firebase;
LCD lcd;

void setup() {
  lcd.begin();

  /*Serial.begin(9600);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while(WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println("WiFi connecté");

  firebase.connexion();*/
}

void loop() {
  lcd.clear();

  lcd.print("Menu de jeux", 10, 30);
}