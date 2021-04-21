class Stimuli {
    xPos: number;
    yPos: number;
    activated: boolean;
    constructor(xPos = 0, yPos = 0) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.activated = false;
    }
}

export default Stimuli;
