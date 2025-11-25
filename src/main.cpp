#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include "game.h"

using namespace std;

Game game;

FirebaseAuth auth;
FirebaseConfig config;
FirebaseData fbdo;
FirebaseJson content;
FirebaseJson tempValue;

void setup() {
  Serial.begin(9600);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while(WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println("WiFi connecté");

  config.api_key = API_KEY;
  config.token_status_callback = tokenStatusCallback;
  auth.user.email = "";
  auth.user.password = "";

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Connexion Firebase OK");
  } else {
    Serial.printf("Erreur Firebase: %s\n", config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  game.init();
  game.addLEDSequence();
}

void loop() {
  game.playSequence();

  if(!game.playerTurn()) {
    tempValue.set("integerValue", millis());
    content.set("fields/temps", tempValue);
    char docPathCStr[30];
    sprintf(docPathCStr, "%lu", millis());

    if (Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, "", docPathCStr, content.raw())) {
      Serial.println("Document créé !");
    } else {
      Serial.printf("Erreur Firestore : %s\n", fbdo.errorReason().c_str());
    }

    game.gameOver();
    game.resetGame();
    delay(2000);
  } else {
      game.addLEDSequence();
      delay(1000);
  }
}