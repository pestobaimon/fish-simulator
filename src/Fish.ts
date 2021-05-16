import * as PIXI from "pixi.js";
import Vector2, { randomUnitVect, distance } from "./Vector2";
import { WIDTH, HEIGHT } from "./gameSettings";

class Fish {
    sprite: PIXI.Sprite;
    leaderScore: number;
    spectate: boolean;

    //force model
    maxSpeed = 120;
    pos: Vector2;
    velocity: Vector2 = randomUnitVect().normalize().scale(this.maxSpeed);

    //visible cone
    visibleRadius = 150;
    visibleAngle = 1.5 * Math.PI;

    stableSpeed = 1;
    excitedSpeed = 10;
    constructor(pos: [number, number], sprite: PIXI.Sprite, spectate: boolean) {
        this.spectate = spectate;
        this.leaderScore = Math.random();
        this.pos = new Vector2(pos);
        this.sprite = sprite;
        [this.sprite.x, this.sprite.y] = this.pos.toArray();
        this.sprite.anchor.set(0.5);
        this.sprite.rotation = this.velocity.angleOrigin();
    }

    move(deltaTime: number): void {
        this.pos = this.pos.add([this.velocity.scale(deltaTime)]);
        this.sprite.y = this.pos.y;
        this.sprite.x = this.pos.x;
        this.sprite.rotation = this.velocity.angleOrigin();
    }

    backwardsVelocity(): Vector2 {
        return this.velocity.normalize().scale(-this.visibleRadius);
    }

    leftVisibleVect(): Vector2 {
        return this.backwardsVelocity().rotate((2 * Math.PI - this.visibleAngle) / 2, true);
    }

    rightVisibleVect(): Vector2 {
        return this.backwardsVelocity().rotate((2 * Math.PI - this.visibleAngle) / 2, false);
    }

    steerClockwise(strength: number): Vector2 {
        const rightVect = new Vector2([-this.velocity.y, this.velocity.x]).normalize();
        return rightVect.scale(strength);
    }

    steerCounterClockwise(strength: number): Vector2 {
        const rightVect = new Vector2([this.velocity.y, -this.velocity.x]).normalize();
        return rightVect.scale(strength);
    }

    steerAwayFromPoint(point: [number, number], strength: number): Vector2 {
        const vectToPoint = new Vector2([point[0] - this.pos.x, point[1] - this.pos.y]);
        const dist = vectToPoint.magnitude();
        const maxDist = this.visibleRadius;
        const strengthSquared = strength * (maxDist - dist) ** 2;
        const onRight = this.velocity.cross(vectToPoint) < 0;

        console.log(`vectToPoint: ${vectToPoint.toArray()}`);
        console.log(`velocity ${this.velocity.toArray()}}`);
        console.log(`cross: ${this.velocity.cross(vectToPoint)}`);

        if (onRight) return this.steerCounterClockwise(strengthSquared);
        else return this.steerClockwise(strengthSquared);
    }

    steerToPoint(point: [number, number], strength: number): Vector2 {
        const vectToPoint = new Vector2([point[0] - this.pos.x, point[1] - this.pos.x]);
        const onRight = this.velocity.cross(vectToPoint) < 0;
        const onLeft = this.velocity.cross(vectToPoint) > 0;
        if (onRight) return this.steerCounterClockwise(strength);
        else if (onLeft) return this.steerClockwise(strength);
        else return new Vector2([0, 0]);
    }

    isVisible(targetFish: Fish): boolean {
        const vect = new Vector2([targetFish.pos.x - this.pos.x, targetFish.pos.y - this.pos.y]);
        const outsideLeftBoundary = this.leftVisibleVect().cross(vect) <= 0;
        const outsideRightBoundary = this.rightVisibleVect().cross(vect) >= 0;
        if (outsideLeftBoundary || outsideRightBoundary) return true;
        else return false;
    }

    updateFish(fishArray: Fish[], deltaTime: number): [Fish[], Vector2] {
        let acceleration = new Vector2([0, 0]);

        let closestFish: Fish | undefined;
        let distanceToClosestFish = 1000000000;

        const visibleFish: Fish[] = [];
        let visibleFishAvgPos = new Vector2([0, 0]);
        let visibleFishVelSum = new Vector2([0, 0]);

        fishArray.forEach((fish: Fish) => {
            if (fish != this) {
                const distanceToFish = distance(this.pos.toArray(), fish.pos.toArray());

                if (distanceToFish <= this.visibleRadius && this.isVisible(fish)) {
                    visibleFish.push(fish);
                    visibleFishVelSum = visibleFishVelSum.add([fish.velocity]);
                    visibleFishAvgPos = visibleFishAvgPos.add([fish.pos]);

                    if (distanceToClosestFish > distanceToFish) {
                        distanceToClosestFish = distanceToFish;
                        closestFish = fish;
                    }
                }
            }
        });

        const visibleFishNum = visibleFish.length;
        if (visibleFishNum > 0 && closestFish) {
            visibleFishAvgPos = visibleFishAvgPos.scale(1 / visibleFishNum);

            const steerAwayFromFishForce = this.steerAwayFromPoint(closestFish.pos.toArray(), 0.1);
            const alignForce = this.steerToPoint(visibleFishVelSum.toArray(), 100);
            const cohesionForce = this.steerToPoint(visibleFishAvgPos.toArray(), 200);

            acceleration = acceleration.add([steerAwayFromFishForce]);
            // acceleration = acceleration.add([alignForce]);
            // acceleration = acceleration.add([cohesionForce]);
        }

        this.velocity = this.velocity.add([acceleration.scale(deltaTime)]);
        this.velocity = this.velocity.clamp(0, this.maxSpeed);

        this.move(deltaTime);
        this.pos = this.avoidCollision();

        return [visibleFish, visibleFishAvgPos];
    }

    avoidCollision(): Vector2 {
        if (this.pos.x < 0) {
            return new Vector2([WIDTH, HEIGHT - this.pos.y]);
        }
        if (this.pos.y < 0) {
            return new Vector2([WIDTH - this.pos.x, HEIGHT]);
        }
        if (this.pos.x > WIDTH) {
            return new Vector2([0, HEIGHT - this.pos.y]);
        }
        if (this.pos.y > HEIGHT) {
            return new Vector2([WIDTH - this.pos.x, 0]);
        }
        return this.pos;
    }
}

export default Fish;
