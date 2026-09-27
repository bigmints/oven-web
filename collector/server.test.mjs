import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {createHandler} from './server.mjs';
const event={type:'pico-analytics-event',id:1,client:'99999999-9999-4999-8999-999999999999',surface:'desktop',name:'rate_app',params:{catalog_app_id:'rise',rating_value:4,private_path:'/Users/private'}};
async function run(handler,data=event,extra={}) {
 const req=Readable.from([typeof data==='string'?data:JSON.stringify(data)]);
 Object.assign(req,{url:'/events',method:'POST',headers:{origin:'https://picorunner.com','content-type':'application/json'},...extra});
 const response={writeHead(status,headers){this.status=status;this.headers=headers;},end(body){this.body=body?JSON.parse(body):null;}};
 await handler(req,response);return response;
}
test('collector forwards only validated fields and keeps advertising denied',async()=>{
 let sent;
 const handler=createHandler({apiSecret:'test-secret',request:async(url,options)=>{sent={url:String(url),body:JSON.parse(options.body)};return {ok:true};}});
 const response=await run(handler);
 assert.equal(response.status,202);assert.equal(sent.body.events[0].name,'rate_app');
 assert.equal(sent.body.events[0].params.rating_value,4);
 assert.equal(sent.body.events[0].params.private_path,undefined);
 assert.equal(sent.body.consent.ad_personalization,'DENIED');
 assert.equal(sent.body.user_id,undefined);assert.equal(sent.body.ip_override,undefined);
 assert.ok(sent.body.events[0].params.session_id>0);
 assert.equal(response.body.accepted,true);
 assert.equal(JSON.stringify(response).includes('test-secret'),false);
});
test('invalid requests do not reach Google',async()=>{
 let requests=0;const handler=createHandler({apiSecret:'test-secret',request:async()=>{requests++;return {ok:true};}});
 for(const data of [{...event,surface:'website'},{...event,name:'private_data'},{...event,params:{catalog_app_id:'rise',rating_value:6}},'{']) assert.equal((await run(handler,data)).status,400);
 assert.equal((await run(handler,event,{headers:{origin:'https://evil.test'}})).status,403);
 assert.equal((await run(handler,'x'.repeat(5000))).status,413);
 assert.equal(requests,0);
});
test('upstream failures are not acknowledged and errors never expose secrets',async()=>{
 const handler=createHandler({apiSecret:'test-secret',request:async()=>{throw Error('https://google.test?secret=test-secret');}});
 const response=await run(handler,{...event,client:'88888888-8888-4888-8888-888888888888'});
 assert.equal(response.status,502);assert.equal(JSON.stringify(response).includes('test-secret'),false);
 assert.equal((await run(createHandler())).status,503);
});
test('QA is validated before ingestion and does not use the public rating event name',async()=>{
 const requests=[];const handler=createHandler({apiSecret:'test-secret',request:async(url,options)=>{requests.push({url:String(url),body:JSON.parse(options.body)});return {ok:true,json:async()=>({validationMessages:[]})};}});
 assert.equal((await run(handler,{...event,test:true,client:'77777777-7777-4777-8777-777777777777'})).status,202);
 assert.equal(requests.length,2);assert.ok(requests[0].url.includes('/debug/mp/collect'));
 assert.equal(requests[1].body.events[0].name,'test_rate_app');
 const rejecting=createHandler({apiSecret:'test-secret',request:async()=>({ok:true,json:async()=>({validationMessages:[{description:'invalid'}]})})});
 assert.equal((await run(rejecting,{...event,test:true})).status,502);
});
test('bounded per-client burst limit prevents unlimited repeated requests',async()=>{
 const handler=createHandler({apiSecret:'test-secret',now:()=>100000,request:async()=>({ok:true})});
 const data={...event,client:'66666666-6666-4666-8666-666666666666'};
 for(let n=0;n<10;n++) assert.equal((await run(handler,data)).status,202);
 assert.equal((await run(handler,data)).status,429);
});
