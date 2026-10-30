type SourceKey = "pipeline" | "core" | "economy" | "settlements" | "stats";
type Validator = ((data: unknown) => boolean) & {
  errors?: { instancePath?: string; message?: string }[] | null;
};
declare const validators: Record<SourceKey, Validator>;
export = validators;
