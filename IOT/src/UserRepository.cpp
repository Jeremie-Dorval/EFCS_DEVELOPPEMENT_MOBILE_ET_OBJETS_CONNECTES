#include "UserRepository.h"

bool UserRepository::updatePoints(String userId, int pointsDelta) {
    String documentPath = "users/" + userId;
    FirebaseData& fbdo = firebase.getData();

    if (!Firebase.Firestore.getDocument(&fbdo, firebase.getProjectId().c_str(), "", documentPath.c_str())) {
        Serial.println("Erreur lecture user: " + fbdo.errorReason());
        return false;
    }

    String payload = fbdo.payload();
    int pointsPos = payload.indexOf("\"points\"");
    if (pointsPos == -1) {
        Serial.println("Erreur: champ points non trouve");
        return false;
    }

    int startVal = payload.indexOf("\"integerValue\": \"", pointsPos) + 17;
    int endVal = payload.indexOf("\"", startVal);
    int currentPoints = payload.substring(startVal, endVal).toInt();

    int newPoints = currentPoints + pointsDelta;
    if (newPoints < 0) newPoints = 0;

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
