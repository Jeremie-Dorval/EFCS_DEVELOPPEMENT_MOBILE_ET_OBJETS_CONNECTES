#ifndef CHALLENGE_REPOSITORY_H
#define CHALLENGE_REPOSITORY_H

#include "FirebaseConnection.h"

class ChallengeRepository {
public:
    ChallengeRepository(FirebaseConnection& conn) : firebase(conn) {}

    int getDifficulty(String playerId, int arrayIndex);
    bool completeChallenge(String playerId, int arrayIndex,
                          int pointsObtained, int stepsCompleted,
                          int totalSteps, int challengerPointsObtained);

private:
    FirebaseConnection& firebase;

    String extractString(const String& section, const char* field);
    int extractInt(const String& section, const char* field, int defaultVal);
};

#endif
