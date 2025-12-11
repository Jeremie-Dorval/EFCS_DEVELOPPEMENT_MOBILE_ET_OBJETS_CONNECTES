#ifndef GAME_SCREEN_H
#define GAME_SCREEN_H

#include "UIRenderer.h"

class GameScreen {
public:
    GameScreen(UIRenderer& renderer) : ui(renderer) {}

    void draw(const String& challenger, int seqLength, int difficulty);
    void updateProgress(int current, int total);

private:
    UIRenderer& ui;
};

#endif
