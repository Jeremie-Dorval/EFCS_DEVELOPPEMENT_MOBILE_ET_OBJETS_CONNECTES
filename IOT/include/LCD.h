#include <Arduino.h>
#include <FirestoreChallenges/FirestoreChallenges.h>
#include "config.h" 

class LCD {
    public:
        // --- Initialisation ---
        void begin();
        void clear();
        void print(const char* message, int x, int y);

        // --- Gestion du menu ---
        void drawMenu();
        void moveCursorUp();
        void moveCursorDown();
        void openSelectedItem();
        void closeCurrentItem();
        void createMenuItems(FirestoreChallenge items[MENU_SIZE]);

        // --- Accès ---
        const FirestoreChallenge* getMenuItems() const { return menuItems; }
        int getSelectedItem() const { return selectedItem; }
        
        // --- Écrans secondaires ---
        void drawCurrentScreen();
        bool handleReturnClick();

        // --- Demande de redessin ---
        void requestRedraw();
        
    private:
        #define ITEM_X_START 10
        #define ITEM_X_END 150
        #define ITEM_Y_START 10
        #define ITEM_Y_2 40
        #define ITEM_Y_3 70

        FirestoreChallenge menuItems[MENU_SIZE] = {};

        int selectedItem = 0;
        int itemCount = 0;  // Nombre réel d'items chargés
        bool shouldRedraw = true;

        ScreenMode currentMode = ScreenMode::MENU;
        FirestoreChallenge currentItem;

        void highlightItem(int itemIndex);
};