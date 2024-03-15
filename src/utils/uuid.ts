import { v4 as uuidv4 } from "uuid";
import { randomAnimalAdjective } from "uuid-to-animal-adjectives";
import { kebabCase } from "change-case";

export const generateUUID = (): string => {
  return uuidv4();
};

export const generateLobbyCode = (): string => {
  return kebabCase(randomAnimalAdjective().animalAdjective);
};

export const generateName = (): string => {
  return randomAnimalAdjective().animalAdjective;
};
