#ifndef USER_REPOSITORY_H
#define USER_REPOSITORY_H

#include "FirebaseConnection.h"

class UserRepository {
public:
    UserRepository(FirebaseConnection& conn) : firebase(conn) {}

    bool updatePoints(String userId, int pointsDelta);

private:
    FirebaseConnection& firebase;
};

#endif
