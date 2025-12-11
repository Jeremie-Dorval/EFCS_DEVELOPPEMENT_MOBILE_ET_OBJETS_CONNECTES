#ifndef CONFIG_H
#define CONFIG_H

#include <DFRobot_GDL.h>

// ============== PINS ==============
#define PIN_BT_GREEN 17
#define PIN_BT_WHITE 16
#define PIN_BT_RED 25

#define PIN_LED_GREEN 32
#define PIN_LED_WHITE 19
#define PIN_LED_RED 21

#define TFT_DC 2
#define TFT_CS 5
#define TFT_RST 4

#define JOY_Y 35
#define JOY_BTN 26

// ============== WIFI & FIREBASE ==============
#define WIFI_SSID "soulkey"
#define WIFI_PASSWORD "qwery12345"

#define API_KEY "AIzaSyDjwhAa0Cq-LeE27MiERX9S-N11ERXLido"
#define FIREBASE_PROJECT_ID "efcs25"

// ============== MENU ==============
#define MENU_SIZE 5

// ============== TIMING (ms) ==============
#define TIMING_NORMAL_ON   500
#define TIMING_NORMAL_OFF  300
#define TIMING_EXPERT_ON   250
#define TIMING_EXPERT_OFF  150
#define TIMING_BLINK       200
#define PLAYER_TIMEOUT     10000
#define REFRESH_INTERVAL   30000

// ============== JOYSTICK ==============
#define DEAD_ZONE_LOW  1500
#define DEAD_ZONE_HIGH 2600

// ============== COULEURS UI ==============
#define UI_COLOR_BG        COLOR_RGB565_BLACK
#define UI_COLOR_TEXT      COLOR_RGB565_WHITE
#define UI_COLOR_TITLE     COLOR_RGB565_CYAN
#define UI_COLOR_HIGHLIGHT COLOR_RGB565_YELLOW
#define UI_COLOR_SELECT_BG COLOR_RGB565_BLUE
#define UI_COLOR_SUCCESS   COLOR_RGB565_GREEN
#define UI_COLOR_FAIL      COLOR_RGB565_RED
#define UI_COLOR_POINTS    COLOR_RGB565_YELLOW
#define UI_COLOR_NORMAL    COLOR_RGB565_GREEN
#define UI_COLOR_EXPERT    COLOR_RGB565_RED

// ============== ENUMS ==============
enum COLOR {
    NONE = 0,
    GREEN = 1,
    WHITE = 2,
    RED = 3
};

enum GameMode {
    MODE_NORMAL = 0,
    MODE_EXPERT = 1
};

enum ScreenMode {
    SCREEN_MENU = 0,
    SCREEN_DIFFICULTY_SELECT = 1,
    SCREEN_GAME_PLAYING = 2,
    SCREEN_GAME_OVER = 3
};

enum GameState {
    STATE_MENU,
    STATE_DIFFICULTY_SELECT,
    STATE_PLAYING,
    STATE_GAME_OVER
};

// ============== STRUCTURES ==============
struct GameResult {
    int pointsGagnes;
    int pointsInfliges;
    int score;
    int sequenceLength;
    bool success;
};

#endif
