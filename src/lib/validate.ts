import compiled from "./generated/validators.cjs";

export type SourceKey = "pipeline" | "core" | "economy" | "settlements" | "stats";
type Validator = ((value: unknown) => boolean) & {
  errors?: { instancePath?: string; message?: string }[] | null;
};
const validators = compiled as unknown as Record<SourceKey, Validator>;
export function validateSource(key: SourceKey, value: unknown): boolean {
  return !!validators[key](value);
}
export function validationIssue(key: SourceKey): string {
  return validators[key].errors?.map(e => `${key}${e.instancePath ?? ""} ${e.message ?? "invalid value"}`).join("; ") || "Invalid source response";
}
