import test from 'node:test';
import assert from 'node:assert/strict';
import {chatTopics,chatProgress,answerChat} from '../chat.js';
import {offers} from '../model.js';
test('全テーマ・全選択肢が2問で有効な案件に到達する',()=>{for(const topic of chatTopics){for(let i=0;i<topic.nodes[topic.first].choices.length;i++){const first=answerChat(topic,[],i);const p=chatProgress(topic,first);assert.ok(p.node);for(let j=0;j<p.node.choices.length;j++){const done=chatProgress(topic,answerChat(topic,first,j));assert.equal(done.messages.length,2);assert.equal(done.node,null);assert.ok(done.result.length);for(const id of done.result)assert.ok(offers.some(o=>o.id===id),id);}}}});
test('回答によって質問とおすすめが変わる',()=>{const topic=chatTopics[0];assert.notEqual(chatProgress(topic,[0]).node.question,chatProgress(topic,[1]).node.question);assert.notDeepEqual(chatProgress(topic,[0,0]).result,chatProgress(topic,[1,0]).result);});
test('完了後や不正な回答では会話を進めず、保存した回答から復元できる',()=>{const topic=chatTopics[0];assert.deepEqual(answerChat(topic,[],99),[]);assert.deepEqual(answerChat(topic,[],0.5),[]);assert.deepEqual(answerChat(topic,[0,1],0),[0,1]);assert.deepEqual(chatProgress(topic,JSON.parse(JSON.stringify([1,0]))),chatProgress(topic,[1,0]));});
