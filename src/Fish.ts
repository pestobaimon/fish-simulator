import Stimuli from "./Stimuli";
import * as PIXI from "pixi.js";

class Fish {
    xPos: number; //x coord
    yPos: number; //y coord
    speed: number; //unit per frame
    directionVector: [number, number]; //radians
    scareDistance: number; //unit
    groupDistance: number; //unit
    groupCloseness: number; // group collision avoidance
    lagTime: number; // frames
    closestFish: Fish | null;
    nextLeadingFish: Fish | null;
    sprite: PIXI.Sprite;
    leaderScore: number;
    stableSpeed = 1;
    excitedSpeed = 10;
    constructor(xPos = 0, yPos = 0, sprite: PIXI.Sprite) {
        this.speed = 0;
        this.directionVector = [0, 1];
        this.scareDistance = 50;
        this.groupDistance = 1000;
        this.groupCloseness = 30;
        this.lagTime = 5;
        this.leaderScore = Math.random();
        this.xPos = sprite.x = xPos;
        this.yPos = sprite.y = yPos;
        this.closestFish = null;
        this.nextLeadingFish = null;
        this.sprite = sprite;
    }

    move(deltaTime: number): void {
        this.yPos += this.getYSpeed() * deltaTime;
        this.xPos += this.getXSpeed() * deltaTime;
        this.sprite.y = this.yPos;
        this.sprite.x = this.xPos;
    }

    getYSpeed(): number {
        const angle = Math.atan2(this.directionVector[1], this.directionVector[0]);
        const ySpeed = this.speed * Math.sin(angle);
        return ySpeed;
    }

    getXSpeed(): number {
        const angle = Math.atan2(this.directionVector[1], this.directionVector[0]);
        const xSpeed = this.speed * Math.cos(angle);
        return xSpeed;
    }

    turn(direction: [number, number]): void {
        this.directionVector = direction;
    }

    steer(): void {
        let angle = Math.random() * (Math.PI / 12) - Math.random() * (Math.PI / 12);
        angle = angle + Math.atan2(this.directionVector[1], this.directionVector[0]);
        const y = Math.sin(angle);
        const x = Math.cos(angle);
        this.directionVector = [x, y];
    }

    setNextLeaderFish(fish: Fish): void {
        this.nextLeadingFish = fish;
    }

    setClosestFish(fish: Fish): void {
        this.closestFish = fish;
    }

    turnToPoint(x: number, y: number): void {
        this.directionVector = getVectorFromAToB(this.xPos, this.yPos, x, y);
    }

    turnToClosestFish(): void {
        try {
            if (this.closestFish === null) {
                throw new Error("no closest Fish");
            }
            this.directionVector = getVectorFromAToB(
                this.xPos,
                this.yPos,
                this.closestFish.xPos,
                this.closestFish.yPos
            );
        } catch (e) {
            console.log(e);
        }
    }

    turnAwayFromClosestFish(): void {
        try {
            if (this.closestFish === null) {
                throw new Error("no closest Fish");
            }
            this.directionVector = getVectorFromAToB(
                this.closestFish.xPos,
                this.closestFish.yPos,
                this.xPos,
                this.yPos
            );
        } catch (e) {
            console.log(e);
        }
    }

    getDistanceToClosestFish(): number {
        try {
            if (this.closestFish === null) {
                throw new Error("no closest Fish");
            }
            return distanceFromAToB(this.xPos, this.yPos, this.closestFish.xPos, this.closestFish.yPos);
        } catch (e) {
            console.log(e);
            return 0;
        }
    }

    scanEnvironment(allFish: Fish[], stimuli: Stimuli, groupXPos: number, groupYPos: number): void {
        allFish.forEach((fish: Fish) => {
            if (fish != this) {
                const distanceToFish = distanceFromAToB(this.xPos, this.yPos, fish.xPos, fish.yPos);
                if (this.closestFish === null) {
                    this.closestFish = fish;
                } else if (distanceToFish < this.getDistanceToClosestFish()) {
                    this.closestFish = fish;
                    if (this.closestFish.speed >= this.excitedSpeed) {
                        this.directionVector = this.closestFish.directionVector;
                        this.speed = fish.speed;
                    }
                }

                if (fish.leaderScore > this.leaderScore) {
                    this.setNextLeaderFish(fish);
                }
            }
        });
        let careStimuli = false;
        if (!stimuli.activated) {
            careStimuli = false;
        } else {
            const distanceToStimuli = distanceFromAToB(this.xPos, this.yPos, stimuli.xPos, stimuli.yPos);
            if (distanceToStimuli < this.scareDistance) {
                this.turn(getVectorFromAToB(stimuli.xPos, stimuli.yPos, this.xPos, this.yPos));
                this.speed = this.excitedSpeed;
                careStimuli = true;
            }
        }
        if (!careStimuli) {
            let careClosestFish = false;
            if (this.closestFish) {
                if (this.getDistanceToClosestFish() < this.groupCloseness) {
                    careClosestFish = true;
                    this.turnAwayFromClosestFish();
                    this.speed = this.stableSpeed;
                } else {
                    this.speed = this.stableSpeed;
                    if (Math.random() > 0.9) {
                        this.steer();
                    }
                }
            } else {
                careClosestFish = false;
            }
            if (!careClosestFish) {
                if (this.nextLeadingFish) {
                    if (
                        distanceFromAToB(this.xPos, this.yPos, this.nextLeadingFish.xPos, this.nextLeadingFish.yPos) >
                        this.groupDistance
                    ) {
                        this.turnToPoint(this.nextLeadingFish.xPos, this.nextLeadingFish.yPos);
                        this.speed = this.stableSpeed;
                    }
                } else {
                    this.speed = this.stableSpeed;
                    if (Math.random() > 0.9) {
                        this.steer();
                    }
                }
            }
        }
    }

    detectCollision(): void {
        if (this.xPos < 0) {
            this.xPos = 0;
            this.directionVector = [-this.directionVector[0], this.directionVector[1]];
        }
        if (this.yPos < 0) {
            this.yPos = 0;
            this.directionVector = [this.directionVector[0], -this.directionVector[1]];
        }
        if (this.xPos > 780) {
            this.xPos = 780;
            this.directionVector = [-this.directionVector[0], this.directionVector[1]];
        }
        if (this.yPos > 780) {
            this.yPos = 780;
            this.directionVector = [this.directionVector[0], -this.directionVector[1]];
        }
    }
}

function getVectorFromAToB(x1: number, y1: number, x2: number, y2: number): [number, number] {
    const d = distanceFromAToB(x1, y1, x2, y2);
    return [(x2 - x1) / d, (y2 - y1) / d];
}

function distanceFromAToB(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
}

export default Fish;
