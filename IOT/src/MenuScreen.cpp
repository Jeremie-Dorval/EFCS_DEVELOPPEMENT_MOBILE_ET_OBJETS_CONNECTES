/**
 * MenuScreen.cpp
 * Ecran du menu principal - affiche la liste des defis disponibles
 */

#include "MenuScreen.h"

// Dessine la liste des defis avec surbrillance sur l'item selectionne (la surbrillance est faite par claude code)
void MenuScreen::draw(FirestoreChallenge items[], int count, int selected) {
    ui.clear();
    ui.drawTitle("DEFIS DISPONIBLES");

    auto& screen = ui.getScreen();

    for (int i = 0; i < count && i < MENU_SIZE; i++) {
        int yOffset = ITEM_Y_START + (i * ITEM_HEIGHT);

        if (i == selected) {
            ui.fillBox(5, yOffset - 5, UIRenderer::SCREEN_WIDTH - 10, ITEM_HEIGHT, UI_COLOR_SELECT_BG);
            ui.setTextColor(UI_COLOR_HIGHLIGHT, UI_COLOR_SELECT_BG);
        } else {
            ui.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
        }

        String titre = "Defi ";
        titre.concat(i + 1);
        titre.concat(": ");
        titre.concat(items[i].challenger);
        ui.print(titre.c_str(), ITEM_X_START, yOffset);

        String seq = "Sequence: ";
        seq.concat(items[i].sequence.length());
        seq.concat(" couleurs");

        ui.setTextSize(1);
        if (i == selected) {
            ui.setTextColor(UI_COLOR_TEXT, UI_COLOR_SELECT_BG);
        } else {
            ui.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
        }
        ui.print(seq.c_str(), ITEM_X_START + 10, yOffset + 20);
        ui.setTextSize(2);
    }

    if (count == 0) {
        ui.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
        ui.printCentered("Aucun defi disponible", 120);
    }

    ui.setTextSize(1);
    ui.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
    ui.printCentered("Joystick: Naviguer | Clic: Selectionner", 220);
    ui.setTextSize(2);
}
