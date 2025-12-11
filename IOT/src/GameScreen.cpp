#include "GameScreen.h"

void GameScreen::draw(const String& challenger, int seqLength, int difficulty) {
    ui.clear();
    ui.drawTitle("DEFI EN COURS");

    ui.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);

    String challengerStr = "Challenger: ";
    challengerStr.concat(challenger);
    ui.print(challengerStr.c_str(), 20, 60);

    String seq = "Sequence: ";
    seq.concat(seqLength);
    seq.concat(" couleurs");
    ui.print(seq.c_str(), 20, 85);

    String diffStr = "Difficulte: ";
    diffStr.concat(difficulty);
    diffStr.concat("/10");
    ui.print(diffStr.c_str(), 20, 110);

    // Couleur selon difficulte
    uint16_t diffColor;
    if (difficulty <= 3) {
        diffColor = UI_COLOR_SUCCESS;
    } else if (difficulty <= 6) {
        diffColor = COLOR_RGB565_YELLOW;
    } else {
        diffColor = UI_COLOR_FAIL;
    }

    // Barre de difficulte
    int barX = 20;
    int barY = 130;
    int barWidth = UIRenderer::SCREEN_WIDTH - 40;
    int barHeight = 10;
    ui.drawBox(barX, barY, barWidth, barHeight, UI_COLOR_TEXT);
    int fillWidth = (difficulty * barWidth) / 10;
    ui.fillBox(barX + 1, barY + 1, fillWidth - 2, barHeight - 2, diffColor);

    ui.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    ui.printCentered("Regardez les LEDs!", 155);

    ui.drawBox(20, 180, UIRenderer::SCREEN_WIDTH - 40, 20, UI_COLOR_TEXT);
}

void GameScreen::updateProgress(int current, int total) {
    if (total <= 0) return;

    int barWidth = UIRenderer::SCREEN_WIDTH - 44;
    int fillWidth = (current * barWidth) / total;

    ui.fillBox(22, 182, fillWidth, 16, UI_COLOR_SUCCESS);

    ui.fillBox(120, 205, 80, 20, UI_COLOR_BG);
    ui.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    String progress = String(current);
    progress.concat("/");
    progress.concat(total);
    ui.printCentered(progress.c_str(), 205);
}
