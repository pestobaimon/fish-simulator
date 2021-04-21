import * as PIXI from "pixi.js";
import "./style.css";
import Fish from "./Fish";
import Stimuli from "./Stimuli";

declare const VERSION: string;

const gameWidth = 800;
const gameHeight = 800;

console.log(`Welcome from pixi-typescript-boilerplate ${VERSION}`);

const app = new PIXI.Application({
    backgroundColor: 0x000000,
    width: gameWidth,
    height: gameHeight,
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
    resizeCanvas();
    stage.interactive = true;
    stage.hitArea = new PIXI.Rectangle(0, 0, gameWidth, gameWidth);
    stage.on("pointertap", (e) => addFish(e));
    stage.on("pointermove", (e) => moveStimuli(e));
    app.ticker.add((delta) => simulationLoop(delta));
};

function simulationLoop(delta: number): void {
    let groupXPos = 0;
    let groupYPos = 0;
    fishArray.forEach((fish) => {
        groupXPos += fish.xPos;
        groupYPos += fish.yPos;
    });
    console.log(groupXPos + "," + groupYPos);
    groupXPos = groupXPos / fishArray.length;
    groupYPos = groupYPos / fishArray.length;

    fishArray.forEach((fish) => {
        fish.scanEnvironment(fishArray, stimuli, groupXPos, groupYPos);
        fish.move(delta);
        fish.detectCollision();
    });
}

function addFish(e: any): void {
    const pos = e.data.global;
    const gr = new PIXI.Graphics();
    gr.beginFill(0xffffff);
    gr.lineStyle(0);
    gr.drawCircle(pos.x, pos.y, 3);
    console.log(pos.x + "," + pos.y);
    gr.endFill();

    const texture = app.renderer.generateTexture(gr);
    const circle = new PIXI.Sprite(texture);
    stage.addChild(circle);
    fishArray.push(new Fish(pos.x, pos.y, circle));
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
        app.stage.scale.x = window.innerWidth / gameWidth;
        app.stage.scale.y = window.innerHeight / gameHeight;
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
