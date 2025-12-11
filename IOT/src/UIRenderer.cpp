#include "UIRenderer.h"

void UIRenderer::begin() {
    Serial.println("Initialisation de l'ecran LCD...");
    screen.begin();
    screen.fillScreen(UI_COLOR_BG);
    screen.setTextSize(2);
    screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    screen.setRotation(1);
}

void UIRenderer::clear() {
    screen.fillScreen(UI_COLOR_BG);
}

void UIRenderer::print(const char* msg, int x, int y) {
    screen.setCursor(x, y);
    screen.print(msg);
}

void UIRenderer::printCentered(const char* msg, int y) {
    int len = strlen(msg);
    int x = (SCREEN_WIDTH - (len * 12)) / 2;
    screen.setCursor(x, y);
    screen.print(msg);
}

void UIRenderer::printLarge(const char* msg, int x, int y) {
    screen.setTextSize(3);
    screen.setCursor(x, y);
    screen.print(msg);
    screen.setTextSize(2);
}

void UIRenderer::drawBox(int x, int y, int w, int h, uint16_t color) {
    screen.drawRect(x, y, w, h, color);
}

void UIRenderer::fillBox(int x, int y, int w, int h, uint16_t color) {
    screen.fillRect(x, y, w, h, color);
}

void UIRenderer::drawTitle(const char* title) {
    screen.setTextColor(UI_COLOR_TITLE, UI_COLOR_BG);
    screen.setTextSize(2);
    printCentered(title, 15);
    screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    screen.drawFastHLine(10, 40, SCREEN_WIDTH - 20, UI_COLOR_TITLE);
}

void UIRenderer::drawHLine(int x, int y, int w, uint16_t color) {
    screen.drawFastHLine(x, y, w, color);
}

void UIRenderer::setTextColor(uint16_t fg, uint16_t bg) {
    screen.setTextColor(fg, bg);
}

void UIRenderer::setTextSize(int size) {
    screen.setTextSize(size);
}
