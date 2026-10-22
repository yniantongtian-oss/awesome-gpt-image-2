import assert from 'node:assert/strict';
import test from 'node:test';
import { fillTemplateBlanks, listTemplateBlanks } from './templateBlanks.js';

const prompt = [
  'Subject: [product, person, or interface]',
  'Scene: [context]',
  'Text: [product, person, or interface]'
].join('\n');

test('template blanks are listed once in first-seen order', () => {
  assert.deepEqual(listTemplateBlanks(prompt), [
    'product, person, or interface',
    'context'
  ]);
  assert.deepEqual(listTemplateBlanks('no blanks here'), []);
  assert.deepEqual(listTemplateBlanks(''), []);
});

test('filled blanks replace placeholders and empty values stay visible', () => {
  const filled = fillTemplateBlanks(prompt, {
    'product, person, or interface': '  fitness dashboard  ',
    context: '   '
  });
  assert.match(filled, /Subject: fitness dashboard/);
  assert.match(filled, /Scene: \[context\]/);
  assert.match(filled, /Text: fitness dashboard/);
  assert.equal(fillTemplateBlanks(prompt, {}), prompt);
});
