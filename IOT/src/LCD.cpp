#include "LCD.h"

void LCD::begin() {
    ui.begin();
}

void LCD::clear() {
    ui.clear();
}

void LCD::print(const char* message, int x, int y) {
    ui.print(message, x, y);
}

void LCD::printCentered(const char* message, int y) {
    ui.printCentered(message, y);
}

// ==================== MENU ====================

void LCD::drawMenu() {
    currentScreen = SCREEN_MENU;
    menuScreen.draw(menuItems, itemCount, selectedItem);
}

void LCD::moveCursorUp() {
    if (itemCount == 0) return;
    selectedItem = (selectedItem > 0) ? selectedItem - 1 : itemCount - 1;
    drawMenu();
}

void LCD::moveCursorDown() {
    if (itemCount == 0) return;
    selectedItem = (selectedItem < itemCount - 1) ? selectedItem + 1 : 0;
    drawMenu();
}

void LCD::createMenuItems(FirestoreChallenge items[MENU_SIZE]) {
    itemCount = 0;
    for (int i = 0; i < MENU_SIZE; i++) {
        menuItems[i] = items[i];
        if (items[i].challenger != "") {
            itemCount++;
        }
    }
}

// ==================== MODE SELECT ====================

void LCD::drawModeSelect(const String& challengerName, int sequenceLength) {
    currentScreen = SCREEN_MODE_SELECT;
    ui.clear();
    ui.drawTitle("CHOISIR LE MODE");

    ui.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    String info = "Defi de: ";
    info.concat(challengerName);
    ui.printCentered(info.c_str(), 50);

    String seqInfo = "Sequence: ";
    seqInfo.concat(sequenceLength);
    seqInfo.concat(" couleurs");
    ui.printCentered(seqInfo.c_str(), 70);

    int normalY = 100;
    if (modeSelection == 0) {
        ui.fillBox(20, normalY - 5, UIRenderer::SCREEN_WIDTH - 40, 50, UI_COLOR_SELECT_BG);
        ui.setTextColor(UI_COLOR_NORMAL, UI_COLOR_SELECT_BG);
    } else {
        ui.drawBox(20, normalY - 5, UIRenderer::SCREEN_WIDTH - 40, 50, UI_COLOR_NORMAL);
        ui.setTextColor(UI_COLOR_NORMAL, UI_COLOR_BG);
    }
    ui.print("> NORMAL", 30, normalY);

    int expertY = 160;
    if (modeSelection == 1) {
        ui.fillBox(20, expertY - 5, UIRenderer::SCREEN_WIDTH - 40, 50, UI_COLOR_SELECT_BG);
        ui.setTextColor(UI_COLOR_EXPERT, UI_COLOR_SELECT_BG);
    } else {
        ui.drawBox(20, expertY - 5, UIRenderer::SCREEN_WIDTH - 40, 50, UI_COLOR_EXPERT);
        ui.setTextColor(UI_COLOR_EXPERT, UI_COLOR_BG);
    }
    ui.print("> EXPERT", 30, expertY);

    ui.setTextSize(1);
    ui.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
    ui.printCentered("Joystick: Changer | Clic: Commencer", 220);
    ui.setTextSize(2);
}

void LCD::moveModeUp() {
    modeSelection = 0;
    drawModeSelect(menuItems[selectedItem].challenger, menuItems[selectedItem].sequence.length());
}

void LCD::moveModeDown() {
    modeSelection = 1;
    drawModeSelect(menuItems[selectedItem].challenger, menuItems[selectedItem].sequence.length());
}

// ==================== JEU ====================

void LCD::drawGamePlaying(const String& challengerName, int sequenceLength, int difficulty) {
    currentScreen = SCREEN_GAME_PLAYING;
    gameScreen.draw(challengerName, sequenceLength, difficulty);
}

void LCD::updateProgress(int current, int total) {
    gameScreen.updateProgress(current, total);
}

// ==================== RESULTAT ====================

void LCD::drawGameOver(const GameResult& result, const String& challengerName) {
    currentScreen = SCREEN_GAME_OVER;
    resultScreen.draw(result, challengerName);
}

// ==================== NAVIGATION ====================

void LCD::setScreen(ScreenMode screen) {
    currentScreen = screen;
    shouldRedraw = true;
}

void LCD::returnToMenu() {
    currentScreen = SCREEN_MENU;
    modeSelection = 0;
    drawMenu();
}

void LCD::requestRedraw() {
    shouldRedraw = true;
}
