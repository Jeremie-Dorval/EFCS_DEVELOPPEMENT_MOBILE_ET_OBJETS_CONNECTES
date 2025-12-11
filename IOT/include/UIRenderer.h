#ifndef UI_RENDERER_H
#define UI_RENDERER_H

#include <DFRobot_GDL.h>
#include "config.h"

class UIRenderer {
public:
    void begin();
    void clear();
    void print(const char* msg, int x, int y);
    void printCentered(const char* msg, int y);
    void printLarge(const char* msg, int x, int y);
    void drawBox(int x, int y, int w, int h, uint16_t color);
    void fillBox(int x, int y, int w, int h, uint16_t color);
    void drawTitle(const char* title);
    void drawHLine(int x, int y, int w, uint16_t color);
    void setTextColor(uint16_t fg, uint16_t bg);
    void setTextSize(int size);

    DFRobot_ST7789_240x320_HW_SPI& getScreen() { return screen; }

    static const int SCREEN_WIDTH = 320;
    static const int SCREEN_HEIGHT = 240;

private:
    DFRobot_ST7789_240x320_HW_SPI screen{TFT_DC, TFT_CS, TFT_RST};
};

#endif
