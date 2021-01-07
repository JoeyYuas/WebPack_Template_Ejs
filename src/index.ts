import { hello } from './ts/sub';
import './scss/style.scss';

console.log('TypeScript 変換成功');
console.log('aaa');

hello();

window.addEventListener('load', () => {
  console.log('IE11で表示されたらTypeScript aaa');
});
