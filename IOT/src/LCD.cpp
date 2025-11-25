#include "LCD.h"

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
        if (i == selectedItem) {
            highlightItem(i);
        } else {
            screen.setTextColor(COLOR_RGB565_WHITE, COLOR_RGB565_BLACK);
        }
        screen.setCursor(10, 30 + i * 30);
        screen.print(menuItems[i]);
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
        case 0: currentMode = ScreenMode::MODE_TEMP; break;
        case 1: currentMode = ScreenMode::MODE_HUMID; break;
        case 2: currentMode = ScreenMode::MODE_LED; break;
    }

    requestRedraw();
}

void LCD::drawCurrentScreen() {
    char buffer[10];

    switch (currentMode) {
        case 0:
            clear();
            screen.setCursor(10, 50);
            screen.print("Température : ");

            dtostrf(dht.readTemperature(), 4, 1, buffer);
            screen.print(buffer);
            screen.print(" °C");
            break;

        case 1:
            clear();
            screen.setCursor(10, 50);
            screen.print("Humidité : ");

            dtostrf(dht.readHumidity(), 4, 1, buffer);
            screen.print(buffer);
            screen.print(" %");
            break;

        case 2:
            clear();
            screen.setCursor(10, 50);
            screen.print("LED RGB");
            break;

        default:
            break;
    }
}

bool LCD::handleReturnClick() {
    if (currentMode != ScreenMode::MODE_MENU) {
        currentMode = ScreenMode::MODE_MENU;
        drawMenu();
        return true;
    }
    return false;
}

void LCD::requestRedraw() {
    // Implémentation pour demander un redessin de l'écran
    shouldRedraw = true;
}

void LCD::highlightItem(int itemIndex) {
    screen.setTextColor(COLOR_RGB565_YELLOW, COLOR_RGB565_BLUE);
}

