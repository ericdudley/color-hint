import { makeAutoObservable } from "mobx";
import { generateUUID } from "./uuid";
import { Gi3DGlasses } from "react-icons/gi";
import { ComponentType, ReactElement } from "react";

export type Player = {
  id: string;
  name: string;
  icon?: IconName;
  color: string;
  isHost: boolean;
};

export default class PlayerSettings {
  id: string = generateUUID();
  name: string = "";
  icon?: IconName;
  color: string = "#000000";
  isHost: boolean = false;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  private saveToStorage() {
    localStorage.setItem(
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
    const data = localStorage.getItem("playerSettings");
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

const IconNames = ["glasses"] as const;

type IconName = (typeof IconNames)[number];

export const ICON_NAME_TO_ICON: Record<
  IconName,
  ComponentType<{ className: string }>
> = {
  glasses: Gi3DGlasses,
};
