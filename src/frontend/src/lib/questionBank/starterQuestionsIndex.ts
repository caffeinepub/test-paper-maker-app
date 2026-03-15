import type { Question } from "../../state/mockData";
import {
  std6Questions,
  std7Questions,
  std8Questions,
} from "./starterQuestionsStd6to8";
import { std9Questions, std10Questions } from "./starterQuestionsStd9to10";
import { std11Questions, std12Questions } from "./starterQuestionsStd11to12";

export const allStarterQuestions: Question[] = [
  ...std6Questions,
  ...std7Questions,
  ...std8Questions,
  ...std9Questions,
  ...std10Questions,
  ...std11Questions,
  ...std12Questions,
];
