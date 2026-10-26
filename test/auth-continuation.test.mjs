import {test} from 'node:test';
import assert from 'node:assert/strict';
import {authContinuationQuery,rfqWorkspaceTarget} from '../app/lib/auth-continuation.ts';
const rfq='0123456789abcdef01234567';
test('auth links preserve a valid RFQ and retain chat priority',()=>{assert.deepEqual(authContinuationQuery({rfq,redirect:'https://example.com'}),{rfq});assert.deepEqual(authContinuationQuery({rfq,chat:'1'}),{chat:'1'});});
test('auth continuation rejects arbitrary URLs, arrays and malformed identifiers',()=>{for(const value of ['https://example.com','//example.com','%2f%2fexample.com',rfq+'/..','../'+rfq,[rfq],null,{},'a'.repeat(25)])assert.deepEqual(authContinuationQuery({rfq:value}),{});});
test('only Buyer and Supplier return to the fixed RFQ workspace path',()=>{for(const role of ['Buyer','Supplier'])assert.equal(rfqWorkspaceTarget({rfq},role),'/workspace/rfqs/'+rfq);for(const role of ['Admin','Investor','Logistics','PaymentPartner','unknown'])assert.equal(rfqWorkspaceTarget({rfq},role),null);});
test('unrecognized redirect parameters never become navigation targets',()=>{assert.equal(rfqWorkspaceTarget({returnTo:'/admin',next:'https://example.com',redirect:'/workspace'},'Buyer'),null);assert.equal(rfqWorkspaceTarget({rfq,chat:'1'},'Buyer'),null);});
