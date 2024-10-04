export enum COMPLEXITY {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

export enum CATEGORY {
  Strings = "Strings",
  Algorithms = "Algorithms",
  DataStructures = "Data Structures",
  BitManipulation = "Bit Manipulation",
  Recursion = "Recursion",
  Databases = "Databases",
  BrainTeaser = "Brain Teaser",
  Arrays = "Arrays",
}

export const COMPLEXITIES = Object.entries(COMPLEXITY).map(
  ([label, value]) => ({
    label,
    value,
  }),
);

export const CATEGORIES = Object.entries(CATEGORY).map(([label, value]) => ({
  label,
  value,
}));
