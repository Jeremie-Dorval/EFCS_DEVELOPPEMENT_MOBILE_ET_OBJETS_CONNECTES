#include "FirebaseConnection.h"
#include "addons/TokenHelper.h"

void FirebaseConnection::connect() {
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

FirebaseData& FirebaseConnection::getData() {
    return fbdo;
}
