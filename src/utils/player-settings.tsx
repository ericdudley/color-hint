import { makeAutoObservable } from "mobx";
import { ComponentType } from "react";
import {
  Gi3DGlasses,
  GiCakeSlice,
  GiPaintBrush,
  GiPaintBucket,
  GiPencilRuler,
  GiPianoKeys,
  GiRainbowStar,
  GiStopSign,
  GiSunCloud,
  GiTreehouse,
  GiTrojanHorse,
  GiWrappedSweet,
} from "react-icons/gi";
import { generateName, generateUUID } from "./uuid";
import { Player } from "@/types";

export default class PlayerSettings {
  id: string = generateUUID();
  name: string = generateName();
  icon: IconName = "paintbrush";
  color: string = "#ffffff";
  isHost: boolean = false;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  private saveToStorage() {
    sessionStorage.setItem(
      "playerSettings",
      JSON.stringify({
        id: this.id,
        name: this.name,
        icon: this.icon,
        color: this.color,
        isHost: this.isHost,
      }),
    );
  }

  private loadFromStorage() {
    const data = sessionStorage.getItem("playerSettings");
    if (data) {
      const settings = JSON.parse(data);
      this.id = settings.id;
      this.name = settings.name;
      this.icon = settings.icon;
      this.color = settings.color;
      this.isHost = settings.isHost;
    }
  }

  setName(name: string) {
    this.name = name;
    this.saveToStorage();
  }
  setIcon(icon: IconName) {
    this.icon = icon;
    this.saveToStorage();
  }
  setColor(color: string) {
    this.color = color;
    this.saveToStorage();
  }
  setIsHost(isHost: boolean) {
    this.isHost = isHost;
    this.saveToStorage();
  }

  get player(): Player {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      color: this.color,
      isHost: this.isHost,
    };
  }

  get isReady(): boolean {
    return !!this.name;
  }
}

export const playerSettings = new PlayerSettings();

export const IconNames = [
  "paintbrush",
  "glasses",
  "paintBucket",
  "cake",
  "pencilRuler",
  "piano",
  "rainbowStar",
  "cloud",
  "stopSign",
  "treehouse",
  "horse",
  "candy",
] as const;

export type IconName = (typeof IconNames)[number];

export const ICON_NAME_TO_ICON: Record<
  IconName,
  ComponentType<{ className: string; style?: { color: string } }>
> = {
  paintbrush: GiPaintBrush,
  glasses: Gi3DGlasses,
  paintBucket: GiPaintBucket,
  cake: GiCakeSlice,
  pencilRuler: GiPencilRuler,
  piano: GiPianoKeys,
  rainbowStar: GiRainbowStar,
  cloud: GiSunCloud,
  stopSign: GiStopSign,
  treehouse: GiTreehouse,
  horse: GiTrojanHorse,
  candy: GiWrappedSweet,
};
