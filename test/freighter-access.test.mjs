import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

// Exercise the actual adapter with a controlled SDK boundary, without a browser,
// wallet keys, network access, approval prompts or transaction submission.
const original = await readFile(new URL('../app/lib/freighter-access.ts', import.meta.url), 'utf8');
const body = stripTypeScriptTypes(original).replace(/^import .+;\n/gm, '').replace('export class ', 'class ');
function adapter(availability, accessResult = { address: 'approved-wallet' }, readResult = { address: 'read-only-wallet' }) {
  const calls = { probes: 0, access: 0, read: 0, waits: 0, network: 0 };
  class Boundary {
    async isAvailable() { calls.probes++; return availability.shift() || false; }
  }
  const Module = new Function('FreighterModule', 'getAddress', 'requestAccess', 'setTimeout', 'getNetwork', body + '\nreturn FreighterAccessModule;')(
    Boundary,
    async () => { calls.read++; return readResult; },
    async () => { calls.access++; return accessResult; },
    callback => { calls.waits++; queueMicrotask(callback); },
    async () => { calls.network++; return { network: 'TESTNET', networkPassphrase: 'Test SDF Network ; September 2015' }; },
  );
  return { instance: new Module(), calls };
}
test('a transient read-only connection failure does not duplicate the permission request', async () => {
  const { instance, calls } = adapter([false, true]);
  assert.deepEqual(await instance.getAddress(), { address: 'approved-wallet' });
  assert.equal(calls.probes, 2); assert.equal(calls.access, 1); assert.equal(calls.read, 0);
});
test('an unavailable extension fails after bounded probes without requesting access', async () => {
  const { instance, calls } = adapter([false, false, false, true]);
  await assert.rejects(instance.getAddress(), { code: 'FREIGHTER_CONNECTION_UNAVAILABLE' });
  assert.equal(calls.probes, 3); assert.equal(calls.access, 0); assert.equal(calls.read, 0);
  assert.equal(calls.network, 1);
});
test('a read-only network warm-up still requires a successful connection probe', async () => {
  const { instance, calls } = adapter([false, false, true]);
  assert.deepEqual(await instance.getAddress(), { address: 'approved-wallet' });
  assert.equal(calls.network, 1); assert.equal(calls.probes, 3); assert.equal(calls.access, 1);
});
test('a permission rejection is returned unchanged and never retried', async () => {
  const rejection = { code: -4, message: 'The user rejected this request.' };
  const { instance, calls } = adapter([true], { error: rejection });
  await assert.rejects(instance.getAddress(), e => e === rejection);
  assert.equal(calls.access, 1); assert.equal(calls.waits, 0); assert.equal(calls.read, 0);
});
test('the explicit read-only path does not request permission', async () => {
  const { instance, calls } = adapter([true]);
  assert.deepEqual(await instance.getAddress({ skipRequestAccess: true }), { address: 'read-only-wallet' });
  assert.equal(calls.read, 1); assert.equal(calls.access, 0);
});
test('an empty approved address fails closed', async () => {
  const { instance, calls } = adapter([true], { address: '' });
  await assert.rejects(instance.getAddress(), { code: 'FREIGHTER_ADDRESS_UNAVAILABLE' });
  assert.equal(calls.access, 1); assert.equal(calls.read, 0);
});
