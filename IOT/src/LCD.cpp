#include "LCD.h"

DFRobot_ST7789_240x320_HW_SPI screen(TFT_DC, TFT_CS, TFT_RST);

// ==================== INITIALISATION ====================

void LCD::begin() {
    Serial.println("Initialisation de l'ecran LCD...");
    screen.begin();
    screen.fillScreen(UI_COLOR_BG);
    screen.setTextSize(2);
    screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    screen.setRotation(1);
}

void LCD::clear() {
    screen.fillScreen(UI_COLOR_BG);
}

void LCD::print(const char* message, int x, int y) {
    screen.setCursor(x, y);
    screen.print(message);
}

void LCD::printCentered(const char* message, int y) {
    int len = strlen(message);
    int x = (SCREEN_WIDTH - (len * 12)) / 2;
    screen.setCursor(x, y);
    screen.print(message);
}

void LCD::printLarge(const char* message, int x, int y) {
    screen.setTextSize(3);
    screen.setCursor(x, y);
    screen.print(message);
    screen.setTextSize(2);
}

// ==================== HELPERS ====================

void LCD::drawBox(int x, int y, int w, int h, uint16_t color) {
    screen.drawRect(x, y, w, h, color);
}

void LCD::drawTitle(const char* title) {
    screen.setTextColor(UI_COLOR_TITLE, UI_COLOR_BG);
    screen.setTextSize(2);
    printCentered(title, 15);
    screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    screen.drawFastHLine(10, 40, SCREEN_WIDTH - 20, UI_COLOR_TITLE);
}

void LCD::highlightItem(int itemIndex) {
    screen.setTextColor(UI_COLOR_HIGHLIGHT, UI_COLOR_SELECT_BG);
}

// ==================== MENU PRINCIPAL ====================

void LCD::drawMenu() {
    clear();
    currentScreen = SCREEN_MENU;

    drawTitle("DEFIS DISPONIBLES");

    for (int i = 0; i < itemCount && i < MENU_SIZE; i++) {
        int yOffset = ITEM_Y_START + (i * ITEM_HEIGHT);

        if (i == selectedItem) {
            screen.fillRect(5, yOffset - 5, SCREEN_WIDTH - 10, ITEM_HEIGHT, UI_COLOR_SELECT_BG);
            screen.setTextColor(UI_COLOR_HIGHLIGHT, UI_COLOR_SELECT_BG);
        } else {
            screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
        }

        String titre = "Defi ";
        titre.concat(i + 1);
        titre.concat(": ");
        titre.concat(menuItems[i].challenger);
        print(titre.c_str(), ITEM_X_START, yOffset);

        String seq = "Sequence: ";
        seq.concat(menuItems[i].sequence.length());
        seq.concat(" couleurs");

        screen.setTextSize(1);
        if (i == selectedItem) {
            screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_SELECT_BG);
        } else {
            screen.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
        }
        print(seq.c_str(), ITEM_X_START + 10, yOffset + 20);
        screen.setTextSize(2);
    }

    if (itemCount == 0) {
        screen.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
        printCentered("Aucun defi disponible", 120);
    }

    screen.setTextSize(1);
    screen.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
    printCentered("Joystick: Naviguer | Clic: Selectionner", 220);
    screen.setTextSize(2);
}

void LCD::moveCursorUp() {
    if (itemCount == 0) return;

    if (selectedItem > 0) {
        selectedItem--;
    } else {
        selectedItem = itemCount - 1;
    }
    drawMenu();
}

void LCD::moveCursorDown() {
    if (itemCount == 0) return;

    if (selectedItem < itemCount - 1) {
        selectedItem++;
    } else {
        selectedItem = 0;
    }
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

// ==================== ECRAN SELECTION MODE ====================

void LCD::drawModeSelect(const String& challengerName, int sequenceLength) {
    clear();
    currentScreen = SCREEN_MODE_SELECT;

    drawTitle("CHOISIR LE MODE");

    screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    String info = "Defi de: ";
    info.concat(challengerName);
    printCentered(info.c_str(), 50);

    String seqInfo = "Sequence: ";
    seqInfo.concat(sequenceLength);
    seqInfo.concat(" couleurs");
    printCentered(seqInfo.c_str(), 70);

    // MODE NORMAL
    int normalY = 100;
    if (modeSelection == 0) {
        screen.fillRect(20, normalY - 5, SCREEN_WIDTH - 40, 50, UI_COLOR_SELECT_BG);
        screen.setTextColor(UI_COLOR_NORMAL, UI_COLOR_SELECT_BG);
    } else {
        screen.drawRect(20, normalY - 5, SCREEN_WIDTH - 40, 50, UI_COLOR_NORMAL);
        screen.setTextColor(UI_COLOR_NORMAL, UI_COLOR_BG);
    }

    print("> NORMAL", 30, normalY);
    screen.setTextSize(1);
    if (modeSelection == 0) {
        screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_SELECT_BG);
    } else {
        screen.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
    }
    print("Vitesse: Lente | Points: x1", 40, normalY + 20);
    print("Ideal pour debuter", 40, normalY + 32);
    screen.setTextSize(2);

    // MODE EXPERT
    int expertY = 160;
    if (modeSelection == 1) {
        screen.fillRect(20, expertY - 5, SCREEN_WIDTH - 40, 50, UI_COLOR_SELECT_BG);
        screen.setTextColor(UI_COLOR_EXPERT, UI_COLOR_SELECT_BG);
    } else {
        screen.drawRect(20, expertY - 5, SCREEN_WIDTH - 40, 50, UI_COLOR_EXPERT);
        screen.setTextColor(UI_COLOR_EXPERT, UI_COLOR_BG);
    }

    print("> EXPERT", 30, expertY);
    screen.setTextSize(1);
    if (modeSelection == 1) {
        screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_SELECT_BG);
    } else {
        screen.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
    }
    print("Vitesse: Rapide | Points: x2", 40, expertY + 20);
    print("Pour les pros!", 40, expertY + 32);
    screen.setTextSize(2);

    screen.setTextSize(1);
    screen.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
    printCentered("Joystick: Changer | Clic: Commencer", 220);
    screen.setTextSize(2);
}

void LCD::moveModeUp() {
    modeSelection = 0;
    drawModeSelect(menuItems[selectedItem].challenger, menuItems[selectedItem].sequence.length());
}

void LCD::moveModeDown() {
    modeSelection = 1;
    drawModeSelect(menuItems[selectedItem].challenger, menuItems[selectedItem].sequence.length());
}

// ==================== ECRAN JEU EN COURS ====================

void LCD::drawGamePlaying(const String& challengerName, int sequenceLength, GameMode mode) {
    clear();
    currentScreen = SCREEN_GAME_PLAYING;

    drawTitle("DEFI EN COURS");

    screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);

    String challenger = "Challenger: ";
    challenger.concat(challengerName);
    print(challenger.c_str(), 20, 60);

    String seq = "Sequence: ";
    seq.concat(sequenceLength);
    seq.concat(" couleurs");
    print(seq.c_str(), 20, 85);

    String modeStr = "Mode: ";
    print(modeStr.c_str(), 20, 110);
    if (mode == MODE_EXPERT) {
        screen.setTextColor(UI_COLOR_EXPERT, UI_COLOR_BG);
        print("EXPERT", 100, 110);
    } else {
        screen.setTextColor(UI_COLOR_NORMAL, UI_COLOR_BG);
        print("NORMAL", 100, 110);
    }

    screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    printCentered("Regardez les LEDs!", 150);

    screen.drawRect(20, 180, SCREEN_WIDTH - 40, 20, UI_COLOR_TEXT);
}

void LCD::updateProgress(int current, int total) {
    if (total <= 0) return;

    int barWidth = SCREEN_WIDTH - 44;
    int fillWidth = (current * barWidth) / total;

    screen.fillRect(22, 182, fillWidth, 16, UI_COLOR_SUCCESS);

    screen.fillRect(120, 205, 80, 20, UI_COLOR_BG);
    screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    String progress = String(current);
    progress.concat("/");
    progress.concat(total);
    printCentered(progress.c_str(), 205);
}

// ==================== ECRAN FIN DE PARTIE ====================

void LCD::drawGameOver(const GameResult& result, const String& challengerName) {
    clear();
    currentScreen = SCREEN_GAME_OVER;

    if (result.success) {
        screen.setTextColor(UI_COLOR_SUCCESS, UI_COLOR_BG);
        screen.setTextSize(3);
        printCentered("REUSSI!", 20);
    } else {
        screen.setTextColor(UI_COLOR_FAIL, UI_COLOR_BG);
        screen.setTextSize(3);
        printCentered("ECHOUE!", 20);
    }
    screen.setTextSize(2);

    uint16_t lineColor = result.success ? UI_COLOR_SUCCESS : UI_COLOR_FAIL;
    screen.drawFastHLine(10, 55, SCREEN_WIDTH - 20, lineColor);

    screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    String scoreStr = "Score: ";
    scoreStr.concat(result.score);
    scoreStr.concat("/");
    scoreStr.concat(result.sequenceLength);
    scoreStr.concat(" couleurs");
    printCentered(scoreStr.c_str(), 70);

    screen.drawRect(30, 95, SCREEN_WIDTH - 60, 80, UI_COLOR_HIGHLIGHT);

    screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    print("Points gagnes:", 45, 105);

    if (result.pointsGagnes >= 0) {
        screen.setTextColor(UI_COLOR_SUCCESS, UI_COLOR_BG);
        String pts = "+";
        pts.concat(result.pointsGagnes);
        print(pts.c_str(), 220, 105);
    } else {
        screen.setTextColor(UI_COLOR_FAIL, UI_COLOR_BG);
        String pts = String(result.pointsGagnes);
        print(pts.c_str(), 220, 105);
    }

    screen.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    print("Pts infliges:", 45, 135);

    screen.setTextSize(1);
    screen.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
    String challengerPts = "(a ";
    challengerPts.concat(challengerName);
    challengerPts.concat(")");
    print(challengerPts.c_str(), 45, 150);
    screen.setTextSize(2);

    if (result.pointsInfliges >= 0) {
        screen.setTextColor(UI_COLOR_FAIL, UI_COLOR_BG);
        String pts = "-";
        pts.concat(result.pointsInfliges);
        print(pts.c_str(), 220, 135);
    } else {
        screen.setTextColor(UI_COLOR_SUCCESS, UI_COLOR_BG);
        String pts = "+";
        pts.concat(-result.pointsInfliges);
        print(pts.c_str(), 220, 135);
    }

    screen.setTextSize(1);
    screen.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
    printCentered("Appuyez pour retourner au menu", 220);
    screen.setTextSize(2);
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
