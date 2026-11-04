import type { DriveKey } from './lifeDriveTypes';
export const keys: readonly DriveKey[];
export type Ranked = { counts:Record<DriveKey,number>; primary:DriveKey[]; secondary:DriveKey[]; pairs:string[]; mode:'single'|'pair'|'multiple' };
export function rankAnswers(answers: unknown): Ranked;
