#ifndef LCD_H
#define LCD_H

#include <Arduino.h>
#include <FirestoreChallenges/FirestoreChallenges.h>
#include "config.h"
#include "UIRenderer.h"
#include "MenuScreen.h"
#include "GameScreen.h"
#include "ResultScreen.h"

class LCD {
public:
    void begin();
    void clear();
    void print(const char* message, int x, int y);
    void printCentered(const char* message, int y);

    // Menu
    void drawMenu();
    void moveCursorUp();
    void moveCursorDown();
    void createMenuItems(FirestoreChallenge items[MENU_SIZE]);

    // Difficulty select
    void drawDifficultySelect(const String& challengerName, int sequenceLength, int currentDifficulty, int mobileDifficulty);
    void moveDifficultyUp();
    void moveDifficultyDown();
    int getSelectedDifficulty() const { return selectedDifficulty; }

    // Jeu
    void drawGamePlaying(const String& challengerName, int sequenceLength, int difficulty);
    void updateProgress(int current, int total);

    // Resultat
    void drawGameOver(const GameResult& result, const String& challengerName);

    // Accesseurs
    const FirestoreChallenge* getMenuItems() const { return menuItems; }
    int getSelectedItem() const { return selectedItem; }
    ScreenMode getCurrentScreen() const { return currentScreen; }

    // Navigation
    void setScreen(ScreenMode screen);
    void returnToMenu();
    void requestRedraw();
    bool needsRedraw() const { return shouldRedraw; }
    void clearRedrawFlag() { shouldRedraw = false; }

private:
    UIRenderer ui;
    MenuScreen menuScreen{ui};
    GameScreen gameScreen{ui};
    ResultScreen resultScreen{ui};

    FirestoreChallenge menuItems[MENU_SIZE] = {};
    int selectedItem = 0;
    int itemCount = 0;
    int selectedDifficulty = 5;
    int mobileDiff = 5;
    bool shouldRedraw = true;
    ScreenMode currentScreen = SCREEN_MENU;
};

#endif
