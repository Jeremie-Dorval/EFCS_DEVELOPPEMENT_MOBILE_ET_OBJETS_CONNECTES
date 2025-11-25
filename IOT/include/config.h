#ifndef CONFIG_H
#define CONFIG_H

#include <DFRobot_GDL.h>

#define PIN_BT_GREEN 17
#define PIN_BT_WHITE 16
#define PIN_BT_RED 15

#define PIN_LED_GREEN 32
#define PIN_LED_WHITE 19
#define PIN_LED_RED 21

#define TFT_DC 2
#define TFT_CS 5
#define TFT_RST 4
extern DFRobot_ST7789_240x320_HW_SPI screen(TFT_DC, TFT_CS, TFT_RST);

#define WIFI_SSID "PORTABLEJÉ_1712"
#define WIFI_PASSWORD ";92454nV"

#define API_KEY "AIzaSyBhRtCNuBjgNDw-QLu6MsQwkcCqeDlwOmI"
#define FIREBASE_PROJECT_ID "tp2-object-connecter"

#define JOY_Y 35
#define JOY_BTN 34

enum COLOR {
    NONE,
    BLUE,
    WHITE,
    YELLOW
};

enum ScreenMode {
    MODE_MENU,
    MODE_TEMP,
    MODE_HUMID,
    MODE_LED
};

#endif // CONFIG_H