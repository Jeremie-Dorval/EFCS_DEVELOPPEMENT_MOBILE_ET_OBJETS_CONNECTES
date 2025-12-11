#ifndef RESULT_SCREEN_H
#define RESULT_SCREEN_H

#include "UIRenderer.h"
#include "config.h"

class ResultScreen {
public:
    ResultScreen(UIRenderer& renderer) : ui(renderer) {}

    void draw(const GameResult& result, const String& challenger);

private:
    UIRenderer& ui;
};

#endif
