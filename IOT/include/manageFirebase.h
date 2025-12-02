#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "config.h"

class ManageFirebase {
    public:
        void connexion();
        FirebaseData& getFirebaseData();

    private: 
        FirebaseAuth auth;
        FirebaseConfig config;
        FirebaseData fbdo;
        FirebaseJson content;
        FirebaseJson tempValue;
};