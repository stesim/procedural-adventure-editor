function S(){}function C(n,t){for(const e in t)n[e]=t[e];return n}function O(n){return n()}function K(){return Object.create(null)}function P(n){n.forEach(O)}function Q(n){return typeof n=="function"}function R(n,t){return n!=n?t==t:n!==t||n&&typeof n=="object"||typeof n=="function"}function W(n){return Object.keys(n).length===0}function q(n,...t){if(n==null){for(const i of t)i(void 0);return S}const e=n.subscribe(...t);return e.unsubscribe?()=>e.unsubscribe():e}function V(n,t,e){n.$$.on_destroy.push(q(t,e))}function X(n,t,e,i){if(n){const c=w(n,t,e,i);return n[0](c)}}function w(n,t,e,i){return n[1]&&i?C(e.ctx.slice(),n[1](i(t))):e.ctx}function Y(n,t,e,i){if(n[2]&&i){const c=n[2](i(e));if(t.dirty===void 0)return c;if(typeof c=="object"){const o=[],r=Math.max(t.dirty.length,c.length);for(let u=0;u<r;u+=1)o[u]=t.dirty[u]|c[u];return o}return t.dirty|c}return t.dirty}function Z(n,t,e,i,c,o){if(c){const r=w(t,e,i,o);n.p(r,c)}}function $(n){if(n.ctx.length>32){const t=[],e=n.ctx.length/32;for(let i=0;i<e;i++)t[i]=-1;return t}return-1}let m=!1;function nn(){m=!0}function tn(){m=!1}function B(n,t,e,i){for(;n<t;){const c=n+(t-n>>1);e(c)<=i?n=c+1:t=c}return n}function I(n){if(n.hydrate_init)return;n.hydrate_init=!0;let t=n.childNodes;if(n.nodeName==="HEAD"){const l=[];for(let s=0;s<t.length;s++){const a=t[s];a.claim_order!==void 0&&l.push(a)}t=l}const e=new Int32Array(t.length+1),i=new Int32Array(t.length);e[0]=-1;let c=0;for(let l=0;l<t.length;l++){const s=t[l].claim_order,a=(c>0&&t[e[c]].claim_order<=s?c+1:B(1,c,j=>t[e[j]].claim_order,s))-1;i[l]=e[a]+1;const v=a+1;e[v]=l,c=Math.max(v,c)}const o=[],r=[];let u=t.length-1;for(let l=e[c]+1;l!=0;l=i[l-1]){for(o.push(t[l-1]);u>=l;u--)r.push(t[u]);u--}for(;u>=0;u--)r.push(t[u]);o.reverse(),r.sort((l,s)=>l.claim_order-s.claim_order);for(let l=0,s=0;l<r.length;l++){for(;s<o.length&&r[l].claim_order>=o[s].claim_order;)s++;const a=s<o.length?o[s]:null;n.insertBefore(r[l],a)}}function M(n,t){if(m){for(I(n),(n.actual_end_child===void 0||n.actual_end_child!==null&&n.actual_end_child.parentNode!==n)&&(n.actual_end_child=n.firstChild);n.actual_end_child!==null&&n.actual_end_child.claim_order===void 0;)n.actual_end_child=n.actual_end_child.nextSibling;t!==n.actual_end_child?(t.claim_order!==void 0||t.parentNode!==n)&&n.insertBefore(t,n.actual_end_child):n.actual_end_child=t.nextSibling}else(t.parentNode!==n||t.nextSibling!==null)&&n.appendChild(t)}function en(n,t,e){m&&!e?M(n,t):(t.parentNode!==n||t.nextSibling!=e)&&n.insertBefore(t,e||null)}function cn(n){n.parentNode&&n.parentNode.removeChild(n)}function T(n){return document.createElement(n)}function x(n){return document.createTextNode(n)}function rn(){return x(" ")}function ln(){return x("")}function un(n,t,e,i){return n.addEventListener(t,e,i),()=>n.removeEventListener(t,e,i)}function on(n,t,e){e==null?n.removeAttribute(t):n.getAttribute(t)!==e&&n.setAttribute(t,e)}function sn(n){return n.dataset.svelteH}function an(n){let t;return{p(...e){t=e,t.forEach(i=>n.push(i))},r(){t.forEach(e=>n.splice(n.indexOf(e),1))}}}function fn(n){return Array.from(n.childNodes)}function D(n){n.claim_info===void 0&&(n.claim_info={last_index:0,total_claimed:0})}function N(n,t,e,i,c=!1){D(n);const o=(()=>{for(let r=n.claim_info.last_index;r<n.length;r++){const u=n[r];if(t(u)){const l=e(u);return l===void 0?n.splice(r,1):n[r]=l,c||(n.claim_info.last_index=r),u}}for(let r=n.claim_info.last_index-1;r>=0;r--){const u=n[r];if(t(u)){const l=e(u);return l===void 0?n.splice(r,1):n[r]=l,c?l===void 0&&n.claim_info.last_index--:n.claim_info.last_index=r,u}}return i()})();return o.claim_order=n.claim_info.total_claimed,n.claim_info.total_claimed+=1,o}function H(n,t,e,i){return N(n,c=>c.nodeName===t,c=>{const o=[];for(let r=0;r<c.attributes.length;r++){const u=c.attributes[r];e[u.name]||o.push(u.name)}o.forEach(r=>c.removeAttribute(r))},()=>i(t))}function _n(n,t,e){return H(n,t,e,T)}function L(n,t){return N(n,e=>e.nodeType===3,e=>{const i=""+t;if(e.data.startsWith(i)){if(e.data.length!==i.length)return e.splitText(i.length)}else e.data=i},()=>x(t),!0)}function dn(n){return L(n," ")}function hn(n,t){t=""+t,n.data!==t&&(n.data=t)}function mn(n,t){n.value=t??""}function pn(n,t,e,i){e==null?n.style.removeProperty(t):n.style.setProperty(t,e,i?"important":"")}function bn(n,t,e){for(let i=0;i<n.options.length;i+=1){const c=n.options[i];if(c.__value===t){c.selected=!0;return}}(!e||t!==void 0)&&(n.selectedIndex=-1)}function yn(n){const t=n.querySelector(":checked");return t&&t.__value}function z(n,t,{bubbles:e=!1,cancelable:i=!1}={}){return new CustomEvent(n,{detail:t,bubbles:e,cancelable:i})}function xn(n,t){return new n(t)}let h;function p(n){h=n}function g(){if(!h)throw new Error("Function called outside component initialization");return h}function gn(n){g().$$.on_mount.push(n)}function vn(n){g().$$.after_update.push(n)}function En(){const n=g();return(t,e,{cancelable:i=!1}={})=>{const c=n.$$.callbacks[t];if(c){const o=z(t,e,{cancelable:i});return c.slice().forEach(r=>{r.call(n,o)}),!o.defaultPrevented}return!0}}const d=[],E=[];let _=[];const k=[],A=Promise.resolve();let y=!1;function F(){y||(y=!0,A.then(G))}function kn(){return F(),A}function U(n){_.push(n)}const b=new Set;let f=0;function G(){if(f!==0)return;const n=h;do{try{for(;f<d.length;){const t=d[f];f++,p(t),J(t.$$)}}catch(t){throw d.length=0,f=0,t}for(p(null),d.length=0,f=0;E.length;)E.pop()();for(let t=0;t<_.length;t+=1){const e=_[t];b.has(e)||(b.add(e),e())}_.length=0}while(d.length);for(;k.length;)k.pop()();y=!1,b.clear(),p(n)}function J(n){if(n.fragment!==null){n.update(),P(n.before_update);const t=n.dirty;n.dirty=[-1],n.fragment&&n.fragment.p(n.ctx,t),n.after_update.forEach(U)}}function wn(n){const t=[],e=[];_.forEach(i=>n.indexOf(i)===-1?t.push(i):e.push(i)),e.forEach(i=>i()),_=t}export{P as A,sn as B,mn as C,U as D,bn as E,un as F,yn as G,En as H,an as I,K as J,G as K,Q as L,W as M,wn as N,h as O,p as P,O as Q,d as R,F as S,nn as T,tn as U,rn as a,vn as b,dn as c,cn as d,ln as e,T as f,_n as g,fn as h,en as i,on as j,pn as k,x as l,L as m,hn as n,gn as o,E as p,xn as q,X as r,R as s,kn as t,Z as u,$ as v,Y as w,M as x,S as y,V as z};
