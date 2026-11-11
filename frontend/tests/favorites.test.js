import test from 'node:test';
import assert from 'node:assert/strict';
import { favoritesKey, readFavorites, claimGuestFavorites } from '../src/lib/favorites.js';
const storage = () => { const data = new Map(); return { getItem:key => data.get(key) ?? null, setItem:(key,value) => data.set(key,value), removeItem:key => data.delete(key) }; };
test('favorites are separated by stable account ID', () => {
  const s=storage();
  s.setItem(favoritesKey({id:1}), '["13"]');
  assert.deepEqual(readFavorites(s, favoritesKey({id:1})), ['13']);
  assert.deepEqual(readFavorites(s, favoritesKey({id:2})), []);
  assert.equal(favoritesKey({id:1,email:'new@example.com'}),favoritesKey({id:1,email:'old@example.com'}));
});
test('guest favorites are claimed only once without leaking to the next account', () => {
  const s=storage();s.setItem('sauz_favorites','["13","14"]');s.setItem(favoritesKey({id:1}),'["13"]');
  claimGuestFavorites(s,{id:1});claimGuestFavorites(s,{id:2});
  assert.deepEqual(readFavorites(s,favoritesKey({id:1})),['13','14']);
  assert.deepEqual(readFavorites(s,favoritesKey({id:2})),[]);
  assert.deepEqual(readFavorites(s,'sauz_favorites'),[]);
});
test('invalid browser storage safely produces an empty favorites list', () => {
  const s=storage();s.setItem('broken','{');assert.deepEqual(readFavorites(s,'broken'),[]);
  s.setItem('broken','[13,"14","14",null]');assert.deepEqual(readFavorites(s,'broken'),['14']);
});
