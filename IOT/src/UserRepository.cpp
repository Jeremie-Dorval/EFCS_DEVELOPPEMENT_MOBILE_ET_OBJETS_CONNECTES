/**
 * UserRepository.cpp
 * Gere les operations sur les utilisateurs dans Firestore
 * Permet de modifier les points des joueurs
 */

#include "UserRepository.h"

// Met a jour les points d'un utilisateur (ajout ou retrait)
// Lit les points actuels, applique le delta, et sauvegarde
bool UserRepository::updatePoints(String userId, int pointsDelta) {
    String documentPath = "users/" + userId;
    FirebaseData& fbdo = firebase.getData();

    // Lire les points actuels
    if (!Firebase.Firestore.getDocument(&fbdo, firebase.getProjectId().c_str(), "", documentPath.c_str())) {
        Serial.println("Erreur lecture user: " + fbdo.errorReason());
        return false;
    }

    // Extraire la valeur des points du JSON Firestore
    String payload = fbdo.payload();
    int pointsPos = payload.indexOf("\"points\"");
    if (pointsPos == -1) {
        Serial.println("Erreur: champ points non trouve");
        return false;
    }

    int startVal = payload.indexOf("\"integerValue\": \"", pointsPos) + 17;
    int endVal = payload.indexOf("\"", startVal);
    int currentPoints = payload.substring(startVal, endVal).toInt();

    // Calculer nouveau total (minimum 0)
    int newPoints = currentPoints + pointsDelta;
    if (newPoints < 0) newPoints = 0;

    // Sauvegarder dans Firestore
    String updateJson = "{\"fields\":{\"points\":{\"integerValue\":\"" + String(newPoints) + "\"}}}";

    if (Firebase.Firestore.patchDocument(&fbdo, firebase.getProjectId().c_str(), "",
                                          documentPath.c_str(), updateJson.c_str(), "points")) {
        Serial.print("Points: "); Serial.print(currentPoints);
        Serial.print(" -> "); Serial.println(newPoints);
        return true;
    }

    Serial.println("Erreur update points: " + fbdo.errorReason());
    return false;
}
