import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import status from "./schemas/status.json";
import core from "./schemas/core.json";
import economy from "./schemas/economy-state.json";
import settlements from "./schemas/settlements.json";
import stats from "./schemas/measurement-stats.json";

const ajv = new Ajv2020({
  strict: false,
  allErrors: false,
  validateFormats: true,
});
addFormats(ajv);
for (const bits of [64, 96, 256]) {
  ajv.addFormat(`uint${bits}-decimal`, {
    type: "string",
    validate: (v: string) => /^\d+$/.test(v) && BigInt(v) < 2n ** BigInt(bits),
  });
}
// The API contract permits new additive fields without a version bump.
// Retain all official constraints, but allow unknown object properties.
function allowAdditiveFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(allowAdditiveFields);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [
        key,
        key === "additionalProperties" && v === false
          ? true
          : allowAdditiveFields(v),
      ]),
    );
  return value;
}
const compile = (schema: object) =>
  ajv.compile(allowAdditiveFields(schema) as object);
const validators = {
  pipeline: compile(status),
  core: compile(core),
  economy: compile(economy),
  settlements: compile(settlements),
  stats: compile(stats),
};
export type SourceKey = keyof typeof validators;
export function validateSource(key: SourceKey, value: unknown): boolean {
  return !!validators[key](value);
}
export function validationIssue(key: SourceKey): string {
  return ajv.errorsText(validators[key].errors, { dataVar: key });
}
