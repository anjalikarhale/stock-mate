import {
  CourseLanguage,
  StageType,
  CourseTopic,
  CourseUnit,
  CourseModule,
} from './types';
import { BASIC_MODULE } from './basicModule';
import { INTERMEDIATE_MODULE } from './intermediateModule';
import { ADVANCED_MODULE } from './advancedModule';

export type {
  CourseLanguage,
  StageType,
  CourseTopic,
  CourseUnit,
  CourseModule,
};

export const COURSE_MODULES: CourseModule[] = [
  BASIC_MODULE,
  INTERMEDIATE_MODULE,
  ADVANCED_MODULE,
];

export function getAllCourseTopics(): CourseTopic[] {
  return COURSE_MODULES.flatMap((mod) =>
    mod.units.flatMap((unit) => unit.topics)
  );
}

export function getCourseTopicById(id: string): CourseTopic | undefined {
  return getAllCourseTopics().find((topic) => topic.id === id);
}

export function getAdjacentTopic(id: string): {
  prev: CourseTopic | null;
  next: CourseTopic | null;
} {
  const all = getAllCourseTopics();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
