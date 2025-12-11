#include "ChallengeRepository.h"

String ChallengeRepository::extractString(const String& section, const char* field) {
    int pos = section.indexOf(field);
    if (pos == -1) return "";
    int start = section.indexOf("\"stringValue\": \"", pos) + 16;
    int end = section.indexOf("\"", start);
    return section.substring(start, end);
}

int ChallengeRepository::extractInt(const String& section, const char* field, int defaultVal) {
    int pos = section.indexOf(field);
    if (pos == -1) return defaultVal;
    int start = section.indexOf("\"integerValue\": \"", pos) + 17;
    int end = section.indexOf("\"", start);
    return section.substring(start, end).toInt();
}

int ChallengeRepository::getDifficulty(String playerId, int arrayIndex) {
    String documentPath = "challenges/" + playerId;
    FirebaseData& fbdo = firebase.getData();

    if (!Firebase.Firestore.getDocument(&fbdo, firebase.getProjectId().c_str(), "", documentPath.c_str())) {
        Serial.println("Erreur lecture difficulte: " + fbdo.errorReason());
        return 5;
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
            return extractInt(section, "\"difficulty\"", 5);
        }
        currentIndex++;
    }

    return 5;
}

bool ChallengeRepository::completeChallenge(String playerId, int arrayIndex,
                                            int pointsObtained, int stepsCompleted,
                                            int totalSteps, int challengerPointsObtained) {
    String documentPath = "challenges/" + playerId;
    FirebaseData& fbdo = firebase.getData();

    if (!Firebase.Firestore.getDocument(&fbdo, firebase.getProjectId().c_str(), "", documentPath.c_str())) {
        Serial.println("Erreur lecture pour update: " + fbdo.errorReason());
        return false;
    }

    String payload = fbdo.payload();
    int valuesStart = payload.indexOf("\"values\": [");
    if (valuesStart == -1) return false;

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

        String challenger = extractString(section, "\"challenger\"");
        String sequence = extractString(section, "\"sequence\"");
        String status = extractString(section, "\"status\"");
        int pts = extractInt(section, "\"pointsObtained\"", 0);
        int diff = extractInt(section, "\"difficulty\"", 5);

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

    if (Firebase.Firestore.patchDocument(&fbdo, firebase.getProjectId().c_str(), "",
                                          documentPath.c_str(), updateJson.c_str(), "challenges")) {
        Serial.println("Defi complete avec succes");
        return true;
    }

    Serial.println("Erreur update defi: " + fbdo.errorReason());
    return false;
}
