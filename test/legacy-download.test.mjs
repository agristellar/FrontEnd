import {test} from 'node:test';
import assert from 'node:assert/strict';
import {legacyDownloadTarget,legacyDownloadName} from '../app/lib/legacy-download.ts';
test('legacy references resolve exclusively to the configured API origin',()=>{
 for(const path of ['report.pdf','uploads/report.pdf','/uploads/report.pdf','/private/tmp/old files/report.pdf'])assert.deepEqual(legacyDownloadTarget(path,'https://api.example.invalid/api','https://app.example.invalid'),{url:'https://api.example.invalid/uploads/report.pdf',filename:'report.pdf'});
 assert.equal(legacyDownloadTarget('/uploads/report.pdf','/api','https://app.example.invalid').url,'https://app.example.invalid/uploads/report.pdf');
});
test('remote URLs credentials protocols and ambiguous path references cannot become bearer-token destinations',()=>{
 for(const path of ['https://evil.invalid/private.pdf','http://evil.invalid/private.pdf','//evil.invalid/file.pdf','javascript:alert(1)','data:text/plain,secret','/uploads/../secret.pdf','/uploads/%2e%2e.pdf','/uploads/x.pdf?token=1','/uploads/x.pdf#private','/uploads/x.pdf\n','/uploads/..','/uploads/.','C:\\uploads\\x.pdf',null,['report.pdf']])assert.equal(legacyDownloadTarget(path,'https://api.example.invalid/api','https://app.example.invalid'),null,String(path));
 for(const base of ['https://user:pass@api.example.invalid/api','javascript:alert(1)','https://api.example.invalid/api?secret=1','https://api.example.invalid/api#anchor'])assert.equal(legacyDownloadTarget('x.pdf',base,'https://app.example.invalid'),null);
});
test('suggested names remove path and control characters and use a bounded fallback',()=>{
 assert.equal(legacyDownloadName('../invoice\n.pdf','stored.pdf'),'.._invoice_.pdf');assert.equal(legacyDownloadName('..','stored.pdf'),'stored.pdf');assert.equal(legacyDownloadName(null,'stored.pdf'),'stored.pdf');assert.equal(legacyDownloadName('a'.repeat(200),'stored.pdf').length,180);
});
test('encrypted private references keep the configured API prefix and reject malformed IDs',()=>{
 const id='abcdefabcdefabcdefabcdef';assert.deepEqual(legacyDownloadTarget('private-file:'+id,'https://api.example.invalid/v1/api/','https://app.example.invalid'),{url:'https://api.example.invalid/v1/api/platform/files/'+id,filename:'document-'+id});
 for(const value of ['private-file:bad','private-file:'+id+'?token=1','private-file://evil.invalid/'+id])assert.equal(legacyDownloadTarget(value,'https://api.example.invalid/api','https://app.example.invalid'),null);
});
