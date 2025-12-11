#ifndef LCD_H
#define LCD_H

#include <Arduino.h>
#include <FirestoreChallenges/FirestoreChallenges.h>
#include "config.h"

class LCD {
    public:
        // --- Initialisation ---
        void begin();
        void clear();
        void print(const char* message, int x, int y);
        void printCentered(const char* message, int y);
        void printLarge(const char* message, int x, int y);

        // --- Gestion du menu principal ---
        void drawMenu();
        void moveCursorUp();
        void moveCursorDown();
        void createMenuItems(FirestoreChallenge items[MENU_SIZE]);

        // --- Ecran selection de mode ---
        void drawModeSelect(const String& challengerName, int sequenceLength);
        void moveModeUp();
        void moveModeDown();
        GameMode getSelectedMode() const { return (modeSelection == 0) ? MODE_NORMAL : MODE_EXPERT; }

        // --- Ecran jeu en cours ---
        void drawGamePlaying(const String& challengerName, int sequenceLength, GameMode mode);
        void updateProgress(int current, int total);

        // --- Ecran fin de partie ---
        void drawGameOver(const GameResult& result, const String& challengerName);

        // --- Acces ---
        const FirestoreChallenge* getMenuItems() const { return menuItems; }
        int getSelectedItem() const { return selectedItem; }
        ScreenMode getCurrentScreen() const { return currentScreen; }

        // --- Navigation ecrans ---
        void setScreen(ScreenMode screen);
        void returnToMenu();

        // --- Demande de redessin ---
        void requestRedraw();
        bool needsRedraw() const { return shouldRedraw; }
        void clearRedrawFlag() { shouldRedraw = false; }

    private:
        // Layout constants
        static const int SCREEN_WIDTH = 320;
        static const int SCREEN_HEIGHT = 240;
        static const int MARGIN = 10;
        static const int ITEM_HEIGHT = 45;

        // Menu layout
        #define ITEM_X_START 10
        #define ITEM_X_END 180
        #define ITEM_Y_START 50
        #define ITEM_Y_2 70
        #define ITEM_Y_3 90

        // Data
        FirestoreChallenge menuItems[MENU_SIZE] = {};
        int selectedItem = 0;
        int itemCount = 0;
        int modeSelection = 0;  // 0 = Normal, 1 = Expert
        bool shouldRedraw = true;

        ScreenMode currentScreen = SCREEN_MENU;

        // Helper methods
        void highlightItem(int itemIndex);
        void drawBox(int x, int y, int w, int h, uint16_t color);
        void drawTitle(const char* title);
};

#endif // LCD_H
