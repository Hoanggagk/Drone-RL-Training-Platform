import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { scenarioOperationIds } from '.';
const contract = readFileSync(
  '../API_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/contracts/openapi.yaml',
  'utf8',
);
const contractIds = [...contract.matchAll(/^\s+operationId:\s*(\w+)\s*$/gm)]
  .map((match) => match[1])
  .sort();
describe('OpenAPI scenario coverage', () => {
  it('maps every current MOD-01 operationId without a hard-coded count', () =>
    expect([...scenarioOperationIds].sort()).toEqual(contractIds));
});
