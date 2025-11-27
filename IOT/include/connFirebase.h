#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include "config.h"

class ConnFirebase {
    public:
        void connexion();

    private: 
        FirebaseAuth auth;
        FirebaseConfig config;
        FirebaseData fbdo;
        FirebaseJson content;
        FirebaseJson tempValue;
};