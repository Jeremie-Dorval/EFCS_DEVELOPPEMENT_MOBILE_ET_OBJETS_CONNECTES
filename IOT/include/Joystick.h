class Joystick {
    public:
        void begin();
        int getHorizontalPosition();
        int getVerticalPosition();
        bool isButtonPressed();
    private:
        const int JOY_X = 34;
        const int JOY_Y = 35;
        const int JOY_BTN = 25;
};