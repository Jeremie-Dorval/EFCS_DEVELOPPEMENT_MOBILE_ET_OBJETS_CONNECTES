#ifndef POINT_CALCULATOR_H
#define POINT_CALCULATOR_H

#include "config.h"

// Calcul des points selon formule exponentielle (identique Mobile)
class PointCalculator {
public:
    static GameResult calculate(int score, int sequenceLength, int difficulty);
};

#endif
