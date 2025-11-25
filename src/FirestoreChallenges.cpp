#include "FirestoreChallenges.h"

FirestoreChallenges::FirestoreChallenges(FirebaseData* firebaseData, String projId) {
  fbdo = firebaseData;
  projectId = projId;
  challengeCount = 0;
}

bool FirestoreChallenges::loadChallenges(String playerId) {
  documentPath = "challenges/";
  documentPath += playerId;
  challengeCount = 0;
  
  if (!Firebase.Firestore.getDocument(fbdo, projectId.c_str(), "", documentPath.c_str())) {
    Serial.println("Erreur lecture : ");
    Serial.println(fbdo->errorReason());
    return false;
  }
  
  String payload = fbdo->payload();
  int searchPos = 0;
  int valuesStart = payload.indexOf("\"values\": [");
  
  if (valuesStart == -1) return false;
  
  searchPos = valuesStart;
  int arrayIndex = 0;  
  
  while (challengeCount < 5) { 
    int mapStart = payload.indexOf("\"mapValue\"", searchPos);
    if (mapStart == -1 || mapStart > payload.indexOf("]", valuesStart)) break;
    
    searchPos = mapStart + 10;
    String section = payload.substring(mapStart, mapStart + 600);
    
    
    int statusPos = section.indexOf("\"status\"");
    String status = "pending";  
    if (statusPos != -1) {
      int startVal = section.indexOf("\"stringValue\": \"", statusPos) + 16;
      int endVal = section.indexOf("\"", startVal);
      status = section.substring(startVal, endVal);
    }
    
    
    if (status != "pending") {
      arrayIndex++; 
      continue;
    }
    
   
    int challPos = section.indexOf("\"challenger\"");
    if (challPos == -1) {
      arrayIndex++;
      continue;
    }
    int startVal = section.indexOf("\"stringValue\": \"", challPos) + 16;
    int endVal = section.indexOf("\"", startVal);
    String challenger = section.substring(startVal, endVal);
    
 
    int seqPos = section.indexOf("\"sequence\"");
    if (seqPos == -1) {
      arrayIndex++;
      continue;
    }
    startVal = section.indexOf("\"stringValue\": \"", seqPos) + 16;
    endVal = section.indexOf("\"", startVal);
    String sequence = section.substring(startVal, endVal);
    
  
    int pointsPos = section.indexOf("\"pointsObtained\"");
    if (pointsPos == -1) {
      arrayIndex++;
      continue;
    }
    startVal = section.indexOf("\"integerValue\": \"", pointsPos) + 17;
    endVal = section.indexOf("\"", startVal);
    int points = section.substring(startVal, endVal).toInt();
    
   
    challenges[challengeCount].index = arrayIndex;
    challenges[challengeCount].challenger = challenger;
    challenges[challengeCount].sequence = sequence;
    challenges[challengeCount].pointsObtained = points;
    challenges[challengeCount].status = status;  
    
    challengeCount++;
    arrayIndex++;
  }
  
  Serial.print("Succes"); Serial.print(challengeCount); Serial.println(" défis pending chargés");
  return true;
}

int FirestoreChallenges::getCount() {
  return challengeCount;
}

FirestoreChallenge FirestoreChallenges::getChallenge(int index) {
  if (index >= 0 && index < challengeCount) {
    return challenges[index];
  }
  return FirestoreChallenge{-1, "", "", 0, ""};  
}

bool FirestoreChallenges::updatePoints(int index, int newPoints) {
  if (index < 0 || index >= challengeCount) return false;
  
  
  challenges[index].pointsObtained = newPoints;
  challenges[index].status = "completed";  
  
  
  if (!Firebase.Firestore.getDocument(fbdo, projectId.c_str(), "", documentPath.c_str())) {
    Serial.println("Erreur lecture avant update : ");
    Serial.println(fbdo->errorReason());
    return false;
  }
  
  String payload = fbdo->payload();
  int searchPos = 0;
  int valuesStart = payload.indexOf("\"values\": [");
  
  String valuesJson = "[";
  int arrayIndex = 0;
  searchPos = valuesStart;
  bool first = true;
  
  while (true) {
    int mapStart = payload.indexOf("\"mapValue\"", searchPos);
    if (mapStart == -1 || mapStart > payload.indexOf("]", valuesStart)) break;
    
    searchPos = mapStart + 10;
    String section = payload.substring(mapStart, mapStart + 600);
    
    // Extraire les valeurs actuelles
    int challPos = section.indexOf("\"challenger\"");
    if (challPos == -1) break;
    int startVal = section.indexOf("\"stringValue\": \"", challPos) + 16;
    int endVal = section.indexOf("\"", startVal);
    String challenger = section.substring(startVal, endVal);
    
    int seqPos = section.indexOf("\"sequence\"");
    startVal = section.indexOf("\"stringValue\": \"", seqPos) + 16;
    endVal = section.indexOf("\"", startVal);
    String sequence = section.substring(startVal, endVal);
    
    int pointsPos = section.indexOf("\"pointsObtained\"");
    startVal = section.indexOf("\"integerValue\": \"", pointsPos) + 17;
    endVal = section.indexOf("\"", startVal);
    int points = section.substring(startVal, endVal).toInt();
    
    int statusPos = section.indexOf("\"status\"");
    String status = "pending";
    if (statusPos != -1) {
      startVal = section.indexOf("\"stringValue\": \"", statusPos) + 16;
      endVal = section.indexOf("\"", startVal);
      status = section.substring(startVal, endVal);
    }
    
    
    bool isUpdated = false;
    for (int i = 0; i < challengeCount; i++) {
      if (challenges[i].index == arrayIndex && i == index) {
        points = newPoints;
        status = "completed";
        isUpdated = true;
        break;
      }
    }
    
    if (!first) valuesJson += ",";
    first = false;
    
    valuesJson += "{\"mapValue\":{\"fields\":{";
    valuesJson += "\"challenger\":{\"stringValue\":\"";
    valuesJson += challenger;
    valuesJson += "\"},";
    valuesJson += "\"sequence\":{\"stringValue\":\"";
    valuesJson += sequence;
    valuesJson += "\"},";
    valuesJson += "\"pointsObtained\":{\"integerValue\":\"";
    valuesJson += String(points);
    valuesJson += "\"},";
    valuesJson += "\"status\":{\"stringValue\":\"";
    valuesJson += status;
    valuesJson += "\"}";
    valuesJson += "}}}";
    
    arrayIndex++;
  }
  
  valuesJson += "]";
  
  String updateJson = "{\"fields\":{\"challenges\":{\"arrayValue\":{\"values\":";
  updateJson += valuesJson;
  updateJson += "}}}}";
  
  if (Firebase.Firestore.patchDocument(fbdo, projectId.c_str(), "", documentPath.c_str(), updateJson.c_str(), "challenges")) {
    Serial.print("Défi ["); Serial.print(index); 
    Serial.print("] complété avec ");
    Serial.print(String(newPoints));
    Serial.print(" points");
    return true;
  }
  
  Serial.println("Erreur update : ");
  Serial.println(fbdo->errorReason());
  return false;
}

void FirestoreChallenges::printAll() {
  for (int i = 0; i < challengeCount; i++) {
    Serial.print("Défi ["); Serial.print(i);
    Serial.print("] → Challenger: "); Serial.print(challenges[i].challenger);
    Serial.print(" | Sequence: "); Serial.print(challenges[i].sequence);
    Serial.print(" | Points: "); Serial.print(challenges[i].pointsObtained);
    Serial.print(" | Status: "); Serial.println(challenges[i].status);
  }
}