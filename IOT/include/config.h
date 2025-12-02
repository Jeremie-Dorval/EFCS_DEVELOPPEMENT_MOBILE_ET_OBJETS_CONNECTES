#ifndef CONFIG_H
#define CONFIG_H

#include <DFRobot_GDL.h>

#define PIN_BT_GREEN 17
#define PIN_BT_WHITE 16
#define PIN_BT_RED 15

#define PIN_LED_GREEN 26
#define PIN_LED_WHITE 19
#define PIN_LED_RED 25

#define TFT_DC 2
#define TFT_CS 5
#define TFT_RST 4

#define WIFI_SSID "PORTABLEJÉ_1712"
#define WIFI_PASSWORD ";92454nV"

#define API_KEY "AIzaSyDjwhAa0Cq-LeE27MiERX9S-N11ERXLido"
#define FIREBASE_PROJECT_ID "efcs25"

#define JOY_Y 35
#define JOY_BTN 34

#define MENU_SIZE 5

enum COLOR {
    NONE = 0,
    GREEN = 1,
    WHITE = 2,
    RED = 3
};

enum ScreenMode {
    MENU = 0,
    DEFIT_1 = 1,
    DEFIT_2 = 2,
    DEFIT_3 = 3,
    DEFIT_4 = 4,
    DEFIT_5 = 5,
};

#endif // CONFIG_H