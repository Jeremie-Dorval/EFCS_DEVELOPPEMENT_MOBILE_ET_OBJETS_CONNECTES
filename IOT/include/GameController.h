#ifndef GAME_CONTROLLER_H
#define GAME_CONTROLLER_H

#include <FirestoreChallenges/FirestoreChallenges.h>
#include "config.h"
#include "game.h"
#include "LCD.h"
#include "Joystick.h"
#include "ChallengeRepository.h"
#include "UserRepository.h"

class GameController {
public:
    GameController(Game& game, LCD& lcd, Joystick& joystick,
                   FirestoreChallenges& challengeManager,
                   ChallengeRepository& challengeRepo,
                   UserRepository& userRepo);

    bool loadChallenges(const String& playerId);
    void update();

    // Pointeur statique pour callback de progression
    static LCD* lcdPtr;

private:
    Game& game;
    LCD& lcd;
    Joystick& joystick;
    FirestoreChallenges& challengeManager;
    ChallengeRepository& challengeRepo;
    UserRepository& userRepo;

    GameState currentState;
    GameResult lastResult;
    String currentChallenger;
    String playerId;
    bool loadError;

    FirestoreChallenge challenges[MENU_SIZE];
    int difficulties[MENU_SIZE];

    // Refresh temps reel
    unsigned long lastRefreshTime = 0;
    void refreshChallenges();
    bool hasChallengesChanged(FirestoreChallenge newChallenges[MENU_SIZE]);

    void handleMenuState();
    void handleDifficultySelectState();
    void handlePlayingState();
    void handleGameOverState();
    void runGame();
};

#endif
