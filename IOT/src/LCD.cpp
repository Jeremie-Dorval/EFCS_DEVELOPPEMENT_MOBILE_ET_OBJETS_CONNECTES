#include "LCD.h"

DFRobot_ST7789_240x320_HW_SPI screen(TFT_DC, TFT_CS, TFT_RST);

void LCD::begin() {
    screen.begin();
    screen.fillScreen(COLOR_RGB565_BLACK);
    screen.setTextSize(2);
    screen.setTextColor(COLOR_RGB565_WHITE, COLOR_RGB565_BLACK);
    screen.setRotation(1);
}

void LCD::clear() {
    screen.fillScreen(COLOR_RGB565_BLACK);
}

void LCD::print(const char* message, int x, int y) {
    screen.setCursor(x, y);
    screen.print(message);
}

void LCD::drawMenu() {
    clear();

    for (int i = 0; i < MENU_SIZE; i++) {

        int yOffset = i * 100;  // Décalage vertical pour chaque défi

        if (i == selectedItem) {
            highlightItem(i);
        } else {
            screen.setTextColor(COLOR_RGB565_WHITE, COLOR_RGB565_BLACK);
        }

        String titre = "Défi ";
        titre.concat(i);

        print(titre.c_str(), 10, 10 + yOffset);
        print("Challenger:", 10, 40 + yOffset);
        print(menuItems[i].challenger.c_str(), 10, 55 + yOffset);
        print("Sequence:", 10, 70 + yOffset);
        print(menuItems[i].sequence.c_str(), 10, 85 + yOffset);
    }
}

void LCD::moveCursorUp() {
    if (selectedItem > 0) {
        selectedItem--;
    } else {
        selectedItem = MENU_SIZE - 1;
    }

    drawMenu();
}

void LCD::moveCursorDown() {
    if (selectedItem < MENU_SIZE - 1) {
        selectedItem++;
    } else {
        selectedItem = 0;
    }

    drawMenu();
}

void LCD::openSelectedItem() {
    switch (selectedItem) {
        case 0: currentMode = ScreenMode::DEFIT_1; break;
        case 1: currentMode = ScreenMode::DEFIT_2; break;
        case 2: currentMode = ScreenMode::DEFIT_3; break;
        case 3: currentMode = ScreenMode::DEFIT_4; break;
        case 4: currentMode = ScreenMode::DEFIT_5; break;
        default: currentMode = ScreenMode::MENU; break;
    }

    requestRedraw();
}

void LCD::closeCurrentItem() {
    currentMode = ScreenMode::MENU;
    drawMenu();
}

void LCD::createMenuItems(FirestoreChallenge items[MENU_SIZE]) {
    for (int i = 0; i < MENU_SIZE; i++) {
        menuItems[i] = items[i];
    }
}

void LCD::drawCurrentScreen() {
    clear();

    switch (currentMode) {
        case ScreenMode::DEFIT_1:
            print("Defit 1 en cours...", 10, 10);
            break;
        case ScreenMode::DEFIT_2:
            print("Defit 2 en cours...", 10, 10);
            break;
        case ScreenMode::DEFIT_3:
            print("Defit 3 en cours...", 10, 10);
            break;
        case ScreenMode::DEFIT_4:
            print("Defit 4 en cours...", 10, 10);
            break;
        case ScreenMode::DEFIT_5:
            print("Defit 5 en cours...", 10, 10);
            break;
        default:
            break;
    }
}

bool LCD::handleReturnClick() {
    if (currentMode != ScreenMode::MENU) {
        closeCurrentItem();
        return true;
    }
    return false;
}

void LCD::requestRedraw() {
    shouldRedraw = true;
}

void LCD::highlightItem(int itemIndex) {
    screen.setTextColor(COLOR_RGB565_YELLOW, COLOR_RGB565_BLUE);
}