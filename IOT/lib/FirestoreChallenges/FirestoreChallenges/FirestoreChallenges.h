#ifndef FIRESTORE_CHALLENGES_H
#define FIRESTORE_CHALLENGES_H

#include <Arduino.h>
#include <Firebase_ESP_Client.h>

struct FirestoreChallenge {
  int index;
  String challenger;
  String sequence;
  int pointsObtained;
  String status; 
};

class FirestoreChallenges {
private:
  FirebaseData* fbdo;
  String projectId;
  String documentPath;
  FirestoreChallenge challenges[5];  
  int challengeCount;

public:
  FirestoreChallenges(FirebaseData* firebaseData, String projId);
  
  bool loadChallenges(String playerId);
  int getCount();
  FirestoreChallenge getChallenge(int index);
  bool updatePoints(int index, int newPoints); 
  void printAll();
};

#endif