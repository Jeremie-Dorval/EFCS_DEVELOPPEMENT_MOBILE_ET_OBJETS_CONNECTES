#include "manageFirebase.h"
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

void ManageFirebase::connexion() {
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
}

FirebaseData& ManageFirebase::getFirebaseData() {
    return fbdo;
}

// Recupere la difficulte d'un defi specifique
int ManageFirebase::getDifficulty(String playerId, int arrayIndex) {
    String documentPath = "challenges/" + playerId;

    if (!Firebase.Firestore.getDocument(&fbdo, projectId.c_str(), "", documentPath.c_str())) {
        Serial.println("Erreur lecture difficulte: " + fbdo.errorReason());
        return 5;  // Valeur par defaut si ca plante
    }

    String payload = fbdo.payload();
    int valuesStart = payload.indexOf("\"values\": [");
    if (valuesStart == -1) return 5;

    int searchPos = valuesStart;
    int currentIndex = 0;

    while (true) {
        int mapStart = payload.indexOf("\"mapValue\"", searchPos);
        if (mapStart == -1) break;

        searchPos = mapStart + 10;

        if (currentIndex == arrayIndex) {
            String section = payload.substring(mapStart, mapStart + 800);
            int diffPos = section.indexOf("\"difficulty\"");
            if (diffPos != -1) {
                int startVal = section.indexOf("\"integerValue\": \"", diffPos) + 17;
                int endVal = section.indexOf("\"", startVal);
                int diff = section.substring(startVal, endVal).toInt();
                Serial.print("Difficulte trouvee: "); Serial.println(diff);
                return diff;
            }
            return 5;  // Pas de difficulty trouve
        }
        currentIndex++;
    }

    return 5;  // Index non trouve
}

// Complete un defi avec tous les champs requis
bool ManageFirebase::completeChallenge(String playerId, int arrayIndex,
                                       int pointsObtained, int stepsCompleted,
                                       int totalSteps, int challengerPointsObtained) {
    String documentPath = "challenges/" + playerId;

    // Relire le document complet
    if (!Firebase.Firestore.getDocument(&fbdo, projectId.c_str(), "", documentPath.c_str())) {
        Serial.println("Erreur lecture pour update: " + fbdo.errorReason());
        return false;
    }

    String payload = fbdo.payload();
    int valuesStart = payload.indexOf("\"values\": [");
    if (valuesStart == -1) {
        Serial.println("Erreur: pas de values trouve");
        return false;
    }

    String valuesJson = "[";
    int searchPos = valuesStart;
    int currentIndex = 0;
    bool first = true;

    while (true) {
        int mapStart = payload.indexOf("\"mapValue\"", searchPos);
        int arrayEnd = payload.indexOf("]", valuesStart);
        if (mapStart == -1 || mapStart > arrayEnd) break;

        searchPos = mapStart + 10;
        String section = payload.substring(mapStart, mapStart + 800);

        // Extraire challenger
        String challenger = "";
        int challPos = section.indexOf("\"challenger\"");
        if (challPos != -1) {
            int startVal = section.indexOf("\"stringValue\": \"", challPos) + 16;
            int endVal = section.indexOf("\"", startVal);
            challenger = section.substring(startVal, endVal);
        }

        // Extraire sequence
        String sequence = "";
        int seqPos = section.indexOf("\"sequence\"");
        if (seqPos != -1) {
            int startVal = section.indexOf("\"stringValue\": \"", seqPos) + 16;
            int endVal = section.indexOf("\"", startVal);
            sequence = section.substring(startVal, endVal);
        }

        // Extraire status
        String status = "pending";
        int statusPos = section.indexOf("\"status\"");
        if (statusPos != -1) {
            int startVal = section.indexOf("\"stringValue\": \"", statusPos) + 16;
            int endVal = section.indexOf("\"", startVal);
            status = section.substring(startVal, endVal);
        }

        // Extraire pointsObtained existant
        int pts = 0;
        int ptsPos = section.indexOf("\"pointsObtained\"");
        if (ptsPos != -1) {
            int startVal = section.indexOf("\"integerValue\": \"", ptsPos) + 17;
            int endVal = section.indexOf("\"", startVal);
            pts = section.substring(startVal, endVal).toInt();
        }

        // Extraire difficulty
        int diff = 5;
        int diffPos = section.indexOf("\"difficulty\"");
        if (diffPos != -1) {
            int startVal = section.indexOf("\"integerValue\": \"", diffPos) + 17;
            int endVal = section.indexOf("\"", startVal);
            diff = section.substring(startVal, endVal).toInt();
        }

        // Si c'est le defi a completer, mettre a jour les valeurs
        if (currentIndex == arrayIndex) {
            pts = pointsObtained;
            status = "completed";
        }

        if (!first) valuesJson += ",";
        first = false;

        valuesJson += "{\"mapValue\":{\"fields\":{";
        valuesJson += "\"challenger\":{\"stringValue\":\"" + challenger + "\"},";
        valuesJson += "\"sequence\":{\"stringValue\":\"" + sequence + "\"},";
        valuesJson += "\"pointsObtained\":{\"integerValue\":\"" + String(pts) + "\"},";
        valuesJson += "\"status\":{\"stringValue\":\"" + status + "\"},";
        valuesJson += "\"difficulty\":{\"integerValue\":\"" + String(diff) + "\"}";

        // Ajouter les champs supplementaires pour le defi complete
        if (currentIndex == arrayIndex) {
            valuesJson += ",\"stepsCompleted\":{\"integerValue\":\"" + String(stepsCompleted) + "\"}";
            valuesJson += ",\"totalSteps\":{\"integerValue\":\"" + String(totalSteps) + "\"}";
            valuesJson += ",\"challengerPointsObtained\":{\"integerValue\":\"" + String(challengerPointsObtained) + "\"}";
        }

        valuesJson += "}}}";
        currentIndex++;
    }

    valuesJson += "]";

    String updateJson = "{\"fields\":{\"challenges\":{\"arrayValue\":{\"values\":";
    updateJson += valuesJson;
    updateJson += "}}}}";

    if (Firebase.Firestore.patchDocument(&fbdo, projectId.c_str(), "",
                                          documentPath.c_str(), updateJson.c_str(), "challenges")) {
        Serial.println("Defi complete avec succes");
        return true;
    }

    Serial.println("Erreur update defi: " + fbdo.errorReason());
    return false;
}

// Met a jour les points d'un utilisateur
bool ManageFirebase::updateUserPoints(String userId, int pointsDelta) {
    String documentPath = "users/" + userId;

    // Lire les points actuels
    if (!Firebase.Firestore.getDocument(&fbdo, projectId.c_str(), "", documentPath.c_str())) {
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
    if (newPoints < 0) newPoints = 0;  // Pas de points negatifs

    String updateJson = "{\"fields\":{\"points\":{\"integerValue\":\"" + String(newPoints) + "\"}}}";

    if (Firebase.Firestore.patchDocument(&fbdo, projectId.c_str(), "",
                                          documentPath.c_str(), updateJson.c_str(), "points")) {
        Serial.print("Points mis a jour pour "); Serial.print(userId);
        Serial.print(": "); Serial.print(currentPoints);
        Serial.print(" -> "); Serial.println(newPoints);
        return true;
    }

    Serial.println("Erreur update points: " + fbdo.errorReason());
    return false;
}