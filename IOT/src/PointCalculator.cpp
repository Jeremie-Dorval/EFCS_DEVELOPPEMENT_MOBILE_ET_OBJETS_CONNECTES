#include "PointCalculator.h"
#include <math.h>

GameResult PointCalculator::calculate(int score, int sequenceLength, int difficulty) {
    GameResult result;
    result.success = (score == sequenceLength);
    result.score = score;
    result.sequenceLength = sequenceLength;

    // Formule exponentielle: calcWin = 2 * (1.5^len - 1)
    float calcWin = 2.0 * (pow(1.5, (float)sequenceLength) - 1.0);
    float difficultyBonus = 1.0 + ((difficulty - 1) * 0.10);
    int pointsToWin = round(calcWin * difficultyBonus);

    // Systeme miroir pour les pertes
    float maxPossibleWin = 2.0 * (pow(1.5, 15.0) - 1.0);
    float minLoss = maxPossibleWin * 0.10;
    int mirrorLength = 5 + 15 - sequenceLength;
    float mirrorLoss = 2.0 * (pow(1.5, (float)mirrorLength) - 1.0);
    float baseLose = max(minLoss, mirrorLoss);
    int pointsToLose = round(baseLose / difficultyBonus);

    // Calcul final base sur le ratio
    float ratio = (float)score / (float)sequenceLength;
    result.pointsGagnes = round(-pointsToLose + (pointsToWin + pointsToLose) * ratio);
    result.pointsInfliges = -result.pointsGagnes;

    return result;
}
