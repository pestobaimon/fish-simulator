import * as PIXI from "pixi.js";
import "./style.css";
import Fish from "./Fish";
import Stimuli from "./Stimuli";
import { WIDTH, HEIGHT } from "./gameSettings";

declare const VERSION: string;

console.log(`Welcome from pixi-typescript-boilerplate ${VERSION}`);

const app = new PIXI.Application({
    backgroundColor: 0x111111,
    width: WIDTH,
    height: HEIGHT,
});

const stage = app.stage;

const fishArray: Fish[] = [];
const stimuli = new Stimuli();

window.onload = async (): Promise<void> => {
    await loadGameAssets();
    const keyObject = keyboard("Control");
    keyObject.press = () => {
        stimuli.activated = true;
        return null;
    };
    keyObject.release = () => {
        stimuli.activated = false;
        return null;
    };
    document.body.appendChild(app.view);
    // resizeCanvas();
    stage.interactive = true;
    stage.hitArea = new PIXI.Rectangle(0, 0, WIDTH, HEIGHT);
    stage.on("pointertap", (e) => addFish(e));
    stage.on("pointermove", (e) => moveStimuli(e));
    app.ticker.add((delta) => simulationLoop(delta / 50));
};

function simulationLoop(delta: number): void {
    fishArray.forEach((fish) => {
        const [visibleFishArray, visibleFishAvgPos] = fish.updateFish(fishArray, delta);
    });
}

function addFish(e: any): void {
    const pos = e.data.global;
    const gr = new PIXI.Graphics();

    gr.beginFill(0xffffff);
    gr.lineStyle(0);
    gr.drawPolygon([-5, 0, -7, -7, 7, 0, -7, 7]);
    console.log(pos.x + "," + pos.y);
    gr.endFill();

    const gr2 = new PIXI.Graphics();
    gr2.beginFill(0xffffff);
    gr2.lineStyle(0);
    gr2.drawCircle(0, 0, 150);
    gr2.endFill();
    const circleTexture = app.renderer.generateTexture(gr2);
    const circle = new PIXI.Sprite(circleTexture);

    const texture = app.renderer.generateTexture(gr);
    const triangle = new PIXI.Sprite(texture);
    stage.addChild(triangle);
    fishArray.push(new Fish([pos.x, pos.y], triangle, false));
}

function moveStimuli(e: any): void {
    const pos = e.data.global;
    stimuli.xPos = pos.x;
    stimuli.yPos = pos.y;
}

async function loadGameAssets(): Promise<void> {
    return new Promise((res, rej) => {
        const loader = PIXI.Loader.shared;
        loader.add("rabbit", "./assets/simpleSpriteSheet.json");

        loader.onComplete.once(() => {
            res();
        });

        loader.onError.once(() => {
            rej();
        });

        loader.load();
    });
}

function resizeCanvas(): void {
    const resize = () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        app.stage.scale.x = window.innerWidth / WIDTH;
        app.stage.scale.y = window.innerHeight / HEIGHT;
    };

    resize();

    window.addEventListener("resize", resize);
}

function keyboard(value: string) {
    const key = {
        value: value,
        isDown: false,
        isUp: true,
        press: () => null,
        release: () => null,
        downHandler: (event: any) => {
            if (event.key === key.value) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
                event.preventDefault();
            }
        },
        upHandler: (event: any) => {
            if (event.key === key.value) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
                event.preventDefault();
            }
        },
        unsubscribe: () => {
            window.removeEventListener("keydown", downListener);
            window.removeEventListener("keyup", upListener);
        },
    };

    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener("keydown", downListener, false);
    window.addEventListener("keyup", upListener, false);

    // Detach event listeners

    return key;
}
