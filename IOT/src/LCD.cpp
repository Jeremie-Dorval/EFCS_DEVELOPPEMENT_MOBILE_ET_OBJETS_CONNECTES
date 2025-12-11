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

// ==================== DIFFICULTY SELECT ====================

void LCD::drawDifficultySelect(const String& challengerName, int sequenceLength, int currentDifficulty, int mobileDifficulty) {
    currentScreen = SCREEN_DIFFICULTY_SELECT;
    selectedDifficulty = currentDifficulty;
    mobileDiff = mobileDifficulty;

    ui.clear();
    ui.drawTitle("DIFFICULTE");

    ui.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    String info = "Defi de: ";
    info.concat(challengerName);
    ui.printCentered(info.c_str(), 50);

    String seqInfo = "Sequence: ";
    seqInfo.concat(sequenceLength);
    seqInfo.concat(" couleurs");
    ui.printCentered(seqInfo.c_str(), 70);

    // Afficher difficulte mobile comme reference
    ui.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
    String mobileInfo = "(Mobile: ";
    mobileInfo.concat(mobileDifficulty);
    mobileInfo.concat("/10)");
    ui.printCentered(mobileInfo.c_str(), 95);

    // Barre de progression de difficulte
    int barX = 40;
    int barY = 130;
    int barWidth = 240;
    int barHeight = 30;

    // Fond de la barre
    ui.drawBox(barX, barY, barWidth, barHeight, UI_COLOR_TEXT);

    // Remplissage selon difficulte
    int fillWidth = (barWidth - 4) * selectedDifficulty / 10;
    uint16_t fillColor = (selectedDifficulty <= 3) ? UI_COLOR_SUCCESS :
                         (selectedDifficulty <= 6) ? UI_COLOR_POINTS :
                         (selectedDifficulty <= 8) ? COLOR_RGB565_ORANGE : UI_COLOR_FAIL;
    ui.fillBox(barX + 2, barY + 2, fillWidth, barHeight - 4, fillColor);

    // Afficher valeur
    ui.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    String diffText = "< ";
    diffText.concat(selectedDifficulty);
    diffText.concat("/10 >");
    ui.printCentered(diffText.c_str(), 170);

    // Nom de la difficulte
    const char* diffName;
    if (selectedDifficulty <= 3) diffName = "FACILE";
    else if (selectedDifficulty <= 6) diffName = "NORMALE";
    else if (selectedDifficulty <= 8) diffName = "DIFFICILE";
    else diffName = "EXTREME";

    ui.setTextColor(fillColor, UI_COLOR_BG);
    ui.printCentered(diffName, 195);

    ui.setTextSize(1);
    ui.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
    ui.printCentered("Joystick: Ajuster | Clic: Commencer", 220);
    ui.setTextSize(2);
}

void LCD::moveDifficultyUp() {
    if (selectedDifficulty < 10) {
        selectedDifficulty++;
        drawDifficultySelect(menuItems[selectedItem].challenger,
                            menuItems[selectedItem].sequence.length(),
                            selectedDifficulty, mobileDiff);
    }
}

void LCD::moveDifficultyDown() {
    if (selectedDifficulty > 1) {
        selectedDifficulty--;
        drawDifficultySelect(menuItems[selectedItem].challenger,
                            menuItems[selectedItem].sequence.length(),
                            selectedDifficulty, mobileDiff);
    }
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
    selectedDifficulty = 5;
    drawMenu();
}

void LCD::requestRedraw() {
    shouldRedraw = true;
}
