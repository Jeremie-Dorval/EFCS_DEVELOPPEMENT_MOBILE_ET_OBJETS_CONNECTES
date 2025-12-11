#ifndef FIREBASE_CONNECTION_H
#define FIREBASE_CONNECTION_H

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "config.h"

class FirebaseConnection {
public:
    void connect();
    FirebaseData& getData();
    String getProjectId() { return projectId; }

private:
    FirebaseAuth auth;
    FirebaseConfig config;
    FirebaseData fbdo;
    String projectId = FIREBASE_PROJECT_ID;
};

#endif
