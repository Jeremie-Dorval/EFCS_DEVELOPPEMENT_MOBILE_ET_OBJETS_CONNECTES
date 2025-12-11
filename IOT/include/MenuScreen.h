#ifndef MENU_SCREEN_H
#define MENU_SCREEN_H

#include "UIRenderer.h"
#include <FirestoreChallenges/FirestoreChallenges.h>

class MenuScreen {
public:
    MenuScreen(UIRenderer& renderer) : ui(renderer) {}

    void draw(FirestoreChallenge items[], int count, int selected);

private:
    UIRenderer& ui;

    static const int ITEM_HEIGHT = 45;
    static const int ITEM_X_START = 10;
    static const int ITEM_Y_START = 50;
};

#endif
