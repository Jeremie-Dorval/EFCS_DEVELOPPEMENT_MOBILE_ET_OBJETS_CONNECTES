#include <Arduino.h>
#include "config.h"

class LCD {
    public:
        static const int MENU_SIZE = 3;

        // --- Initialisation ---
        void begin();
        void clear();
        void print(const char* message, int x, int y);

        // --- Gestion du menu ---
        void drawMenu();
        void moveCursorUp();
        void moveCursorDown();
        void openSelectedItem();

        // --- Accès ---
        const char* const* getMenuItems() const { return menuItems; }
        int getSelectedItem() const { return selectedItem; }
        
        // --- Écrans secondaires ---
        void drawCurrentScreen();
        bool handleReturnClick();

        // --- Gestion du LED ---
        void startLEDBlink();
        void stopLEDBlink();

        // --- Demande de redessin ---
        void requestRedraw();
        
    private:
        const char *menuItems[MENU_SIZE] = {
            "Option 1: Température", //Affichage de la température
            "Option 2: Humidité", //Affichage de l'humidité
            "Option 3: LED RGB", //Clignotement du led (couleur de votre choix)
        };

        int selectedItem = 0;
        bool shouldRedraw = true;

        ScreenMode currentMode = ScreenMode::MODE_MENU;

        void highlightItem(int itemIndex);
};