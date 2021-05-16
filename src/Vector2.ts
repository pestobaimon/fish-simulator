class Vector2 {
    x: number;
    y: number;
    constructor(pos: [number, number]) {
        this.x = pos[0];
        this.y = pos[1];
    }

    set(pos: [number, number]): void {
        [this.x, this.y] = pos;
    }

    add(vectors: Vector2[]): Vector2 {
        const newVect = this.clone();
        vectors.forEach((vector) => {
            newVect.x += vector.x;
            newVect.y += vector.y;
        });
        return newVect;
    }

    clone(): Vector2 {
        return new Vector2(this.toArray());
    }

    toArray(): [number, number] {
        return [this.x, this.y];
    }

    cross(vect: Vector2): number {
        return this.x * vect.y - vect.x * this.y;
    }

    dot(vect: Vector2): number {
        return this.x * vect.x + this.y * vect.y;
    }

    scale(magnitude: number): Vector2 {
        return new Vector2([this.x * magnitude, this.y * magnitude]);
    }

    rotate(radians: number, clockwise = false): Vector2 {
        if (clockwise) radians = -radians;
        const x = this.x * Math.cos(radians) - this.y * Math.sin(radians);
        const y = this.y * Math.sin(radians) + this.y * Math.cos(radians);
        return new Vector2([x, y]);
    }

    magnitude(): number {
        return (this.x ** 2 + this.y ** 2) ** 0.5;
    }

    flip(): Vector2 {
        return this.scale(-1);
    }

    normalize(): Vector2 {
        const length = this.magnitude();
        try {
            if (length == 0) throw "cannot normalize vector with magnitude 0";
            return new Vector2([this.x / length, this.y / length]);
        } catch (error) {
            console.log(`error ${error}`);
            return new Vector2([0, 0]);
        }
    }

    clamp(min = 0, max: number): Vector2 {
        if (this.magnitude() < min) return this.normalize().scale(min);
        else if (this.magnitude() > max) return this.normalize().scale(max);
        else return this;
    }

    angle(targetVect: Vector2): number {
        const dy = targetVect.y - this.y;
        const dx = targetVect.x - this.x;
        return Math.atan2(dy, dx);
    }

    angleOrigin(): number {
        return Math.atan2(this.y, this.x);
    }
}

const randomUnitVect = (): Vector2 => {
    const vect = new Vector2([gaussianRandom(), gaussianRandom()]);
    return vect.normalize();
};

const gaussianRandom = (): number => {
    let u = 0,
        v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return gaussianRandom(); // resample between 0 and 1
    return num;
};

const distance = (pos1: [number, number], pos2: [number, number]): number => {
    return ((pos2[0] - pos1[0]) ** 2 + (pos2[1] - pos1[1]) ** 2) ** 0.5;
};

export default Vector2;
export { randomUnitVect, gaussianRandom, distance };
