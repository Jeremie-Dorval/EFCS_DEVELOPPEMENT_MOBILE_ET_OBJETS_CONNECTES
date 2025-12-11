/**
 * ResultScreen.cpp
 * Ecran de fin de partie - affiche score et points gagnes/infliges
 */

#include "ResultScreen.h"

// Dessine l'ecran de resultat avec score et points (la couleur est faites par claude code prompt: peu tu me rajouter des couleurs attrayantes)
void ResultScreen::draw(const GameResult& result, const String& challenger) {
    ui.clear();

    if (result.success) {
        ui.setTextColor(UI_COLOR_SUCCESS, UI_COLOR_BG);
        ui.setTextSize(3);
        ui.printCentered("REUSSI!", 20);
    } else {
        ui.setTextColor(UI_COLOR_FAIL, UI_COLOR_BG);
        ui.setTextSize(3);
        ui.printCentered("ECHOUE!", 20);
    }
    ui.setTextSize(2);

    uint16_t lineColor = result.success ? UI_COLOR_SUCCESS : UI_COLOR_FAIL;
    ui.drawHLine(10, 55, UIRenderer::SCREEN_WIDTH - 20, lineColor);

    ui.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    String scoreStr = "Score: ";
    scoreStr.concat(result.score);
    scoreStr.concat("/");
    scoreStr.concat(result.sequenceLength);
    scoreStr.concat(" couleurs");
    ui.printCentered(scoreStr.c_str(), 70);

    ui.drawBox(30, 95, UIRenderer::SCREEN_WIDTH - 60, 80, UI_COLOR_HIGHLIGHT);

    ui.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    ui.print("Points gagnes:", 45, 105);

    if (result.pointsGagnes >= 0) {
        ui.setTextColor(UI_COLOR_SUCCESS, UI_COLOR_BG);
        String pts = "+";
        pts.concat(result.pointsGagnes);
        ui.print(pts.c_str(), 220, 105);
    } else {
        ui.setTextColor(UI_COLOR_FAIL, UI_COLOR_BG);
        String pts = String(result.pointsGagnes);
        ui.print(pts.c_str(), 220, 105);
    }

    ui.setTextColor(UI_COLOR_TEXT, UI_COLOR_BG);
    ui.print("Pts infliges:", 45, 135);

    ui.setTextSize(1);
    ui.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
    String challengerPts = "(a ";
    challengerPts.concat(challenger);
    challengerPts.concat(")");
    ui.print(challengerPts.c_str(), 45, 150);
    ui.setTextSize(2);

    if (result.pointsInfliges >= 0) {
        ui.setTextColor(UI_COLOR_FAIL, UI_COLOR_BG);
        String pts = "-";
        pts.concat(result.pointsInfliges);
        ui.print(pts.c_str(), 220, 135);
    } else {
        ui.setTextColor(UI_COLOR_SUCCESS, UI_COLOR_BG);
        String pts = "+";
        pts.concat(-result.pointsInfliges);
        ui.print(pts.c_str(), 220, 135);
    }

    ui.setTextSize(1);
    ui.setTextColor(COLOR_RGB565_LGRAY, UI_COLOR_BG);
    ui.printCentered("Appuyez pour retourner au menu", 220);
    ui.setTextSize(2);
}
