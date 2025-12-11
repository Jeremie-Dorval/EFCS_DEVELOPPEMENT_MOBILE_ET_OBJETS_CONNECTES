#ifndef MANAGE_FIREBASE_H
#define MANAGE_FIREBASE_H

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "config.h"

class ManageFirebase {
    public:
        void connexion();
        FirebaseData& getFirebaseData();

        // methodes pour gerer la difficulte et les points (car pas dans la lib et je voulais que ca sois coté mob.)
        int getDifficulty(String playerId, int arrayIndex);
        bool completeChallenge(String playerId, int arrayIndex,
                              int pointsObtained, int stepsCompleted,
                              int totalSteps, int challengerPointsObtained);
        bool updateUserPoints(String userId, int pointsDelta);

    private:
        FirebaseAuth auth;
        FirebaseConfig config;
        FirebaseData fbdo;
        FirebaseJson content;
        FirebaseJson tempValue;
        String projectId = FIREBASE_PROJECT_ID;
};

#endif