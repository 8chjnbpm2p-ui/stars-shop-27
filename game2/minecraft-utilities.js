/*
 * Adapted from Mojang's minecraft-scripting-libraries:
 * https://github.com/Mojang/minecraft-scripting-libraries
 *
 * Copyright (c) 2023 Mojang AB
 * Portions copyright (c) Microsoft Corporation.
 * Licensed under the MIT License. See LICENSE-MOJANG.txt.
 *
 * This browser-safe adaptation removes Minecraft-specific types and APIs.
 */

export function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export class Vector3Utils {
  static equals(a,b){return a.x===b.x&&a.y===b.y&&a.z===b.z}
  static add(a,b){return{x:a.x+(b.x??0),y:a.y+(b.y??0),z:a.z+(b.z??0)}}
  static subtract(a,b){return{x:a.x-(b.x??0),y:a.y-(b.y??0),z:a.z-(b.z??0)}}
  static scale(v,n){return{x:v.x*n,y:v.y*n,z:v.z*n}}
  static dot(a,b){return a.x*b.x+a.y*b.y+a.z*b.z}
  static cross(a,b){return{x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x}}
  static magnitude(v){return Math.hypot(v.x,v.y,v.z)}
  static distance(a,b){return this.magnitude(this.subtract(a,b))}
  static normalize(v){const n=this.magnitude(v);return n?this.scale(v,1/n):{x:0,y:0,z:0}}
  static floor(v){return{x:Math.floor(v.x),y:Math.floor(v.y),z:Math.floor(v.z)}}
  static ceil(v){return{x:Math.ceil(v.x),y:Math.ceil(v.y),z:Math.ceil(v.z)}}
  static min(a,b){return{x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),z:Math.min(a.z,b.z)}}
  static max(a,b){return{x:Math.max(a.x,b.x),y:Math.max(a.y,b.y),z:Math.max(a.z,b.z)}}
  static multiply(a,b){return{x:a.x*b.x,y:a.y*b.y,z:a.z*b.z}}
  static lerp(a,b,t){return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t}}
  static clamp(v,limits={}){return{x:clampNumber(v.x,limits.min?.x??Number.MIN_SAFE_INTEGER,limits.max?.x??Number.MAX_SAFE_INTEGER),y:clampNumber(v.y,limits.min?.y??Number.MIN_SAFE_INTEGER,limits.max?.y??Number.MAX_SAFE_INTEGER),z:clampNumber(v.z,limits.min?.z??Number.MIN_SAFE_INTEGER,limits.max?.z??Number.MAX_SAFE_INTEGER)}}
  static rotateX(v,a){const c=Math.cos(a),s=Math.sin(a);return{x:v.x,y:v.y*c-v.z*s,z:v.z*c+v.y*s}}
  static rotateY(v,a){const c=Math.cos(a),s=Math.sin(a);return{x:v.x*c+v.z*s,y:v.y,z:v.z*c-v.x*s}}
  static rotateZ(v,a){const c=Math.cos(a),s=Math.sin(a);return{x:v.x*c-v.y*s,y:v.y*c+v.x*s,z:v.z}}
  static toString(v,options={}){return[v.x,v.y,v.z].map(n=>Number(n).toFixed(options.decimals??2)).join(options.delimiter??', ')}
  static fromString(value,delimiter=','){const p=String(value).split(delimiter).map(Number);return p.length===3&&p.every(Number.isFinite)?{x:p[0],y:p[1],z:p[2]}:undefined}
}

export class Vector3Builder {
  constructor(value={x:0,y:0,z:0}){this.x=value.x??0;this.y=value.y??0;this.z=value.z??0}
  assign(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}
  add(v){return this.assign(Vector3Utils.add(this,v))}
  subtract(v){return this.assign(Vector3Utils.subtract(this,v))}
  scale(n){return this.assign(Vector3Utils.scale(this,n))}
  normalize(){return this.assign(Vector3Utils.normalize(this))}
  floor(){return this.assign(Vector3Utils.floor(this))}
  clamp(limits){return this.assign(Vector3Utils.clamp(this,limits))}
  lerp(v,t){return this.assign(Vector3Utils.lerp(this,v,t))}
  dot(v){return Vector3Utils.dot(this,v)}
  cross(v){return this.assign(Vector3Utils.cross(this,v))}
  magnitude(){return Vector3Utils.magnitude(this)}
  distance(v){return Vector3Utils.distance(this,v)}
  toJSON(){return{x:this.x,y:this.y,z:this.z}}
  toString(){return Vector3Utils.toString(this)}
}

export class AABBInvalidExtentError extends Error {
  constructor(extent){super('Invalid AABB extent: '+Vector3Utils.toString(extent));this.name='AABBInvalidExtentError'}
}

export class AABBUtils {
  static EPSILON=0.00001;
  static isValid(box){return !!box&&box.extent&&box.extent.x>=this.EPSILON&&box.extent.y>=this.EPSILON&&box.extent.z>=this.EPSILON}
  static throwErrorIfInvalid(box){if(!this.isValid(box))throw new AABBInvalidExtentError(box?.extent??{x:0,y:0,z:0})}
  static createFromCornerPoints(a,b){const min=Vector3Utils.min(a,b),max=Vector3Utils.max(a,b),extent=Vector3Utils.scale(Vector3Utils.subtract(max,min),.5);const box={center:Vector3Utils.add(min,extent),extent};this.throwErrorIfInvalid(box);return box}
  static getMin(box){this.throwErrorIfInvalid(box);return Vector3Utils.subtract(box.center,box.extent)}
  static getMax(box){this.throwErrorIfInvalid(box);return Vector3Utils.add(box.center,box.extent)}
  static getSpan(box){this.throwErrorIfInvalid(box);return Vector3Utils.scale(box.extent,2)}
  static equals(a,b){this.throwErrorIfInvalid(a);this.throwErrorIfInvalid(b);return Vector3Utils.equals(a.center,b.center)&&Vector3Utils.equals(a.extent,b.extent)}
  static translate(box,delta){this.throwErrorIfInvalid(box);return{center:Vector3Utils.add(box.center,delta),extent:{...box.extent}}}
  static dilate(box,size){this.throwErrorIfInvalid(box);return{center:{...box.center},extent:Vector3Utils.clamp(Vector3Utils.add(box.extent,size),{min:{x:this.EPSILON,y:this.EPSILON,z:this.EPSILON}})}}
  static expand(a,b){this.throwErrorIfInvalid(a);this.throwErrorIfInvalid(b);return this.createFromCornerPoints(Vector3Utils.min(this.getMin(a),this.getMin(b)),Vector3Utils.max(this.getMax(a),this.getMax(b)))}
  static intersects(a,b){this.throwErrorIfInvalid(a);this.throwErrorIfInvalid(b);const amin=this.getMin(a),amax=this.getMax(a),bmin=this.getMin(b),bmax=this.getMax(b);return !(bmax.x<amin.x||bmin.x>amax.x||bmax.y<amin.y||bmin.y>amax.y||bmax.z<amin.z||bmin.z>amax.z)}
  static getIntersection(a,b){if(!this.intersects(a,b))return undefined;return this.createFromCornerPoints(Vector3Utils.max(this.getMin(a),this.getMin(b)),Vector3Utils.min(this.getMax(a),this.getMax(b)))}
  static isInside(box,p){this.throwErrorIfInvalid(box);const min=this.getMin(box),max=this.getMax(box);return p.x>=min.x&&p.x<=max.x&&p.y>=min.y&&p.y<=max.y&&p.z>=min.z&&p.z<=max.z}
}

export const Colors = Object.freeze({
  Black:{red:29/255,green:29/255,blue:33/255,alpha:1},
  Blue:{red:60/255,green:68/255,blue:170/255,alpha:1},
  Brown:{red:131/255,green:84/255,blue:50/255,alpha:1},
  Cyan:{red:22/255,green:156/255,blue:156/255,alpha:1},
  Gray:{red:71/255,green:79/255,blue:82/255,alpha:1},
  Green:{red:94/255,green:124/255,blue:22/255,alpha:1},
  LightBlue:{red:58/255,green:179/255,blue:218/255,alpha:1},
  Lime:{red:128/255,green:199/255,blue:31/255,alpha:1},
  Magenta:{red:199/255,green:78/255,blue:189/255,alpha:1},
  Orange:{red:249/255,green:128/255,blue:29/255,alpha:1},
  Pink:{red:243/255,green:139/255,blue:170/255,alpha:1},
  Purple:{red:137/255,green:50/255,blue:184/255,alpha:1},
  Red:{red:176/255,green:46/255,blue:38/255,alpha:1},
  Silver:{red:157/255,green:157/255,blue:151/255,alpha:1},
  White:{red:240/255,green:240/255,blue:240/255,alpha:1},
  Yellow:{red:254/255,green:216/255,blue:61/255,alpha:1},
  PureWhite:{red:1,green:1,blue:1,alpha:1},
  PureBlack:{red:0,green:0,blue:0,alpha:1},
  PureRed:{red:1,green:0,blue:0,alpha:1},
  PureGreen:{red:0,green:1,blue:0,alpha:1},
  PureBlue:{red:0,green:0,blue:1,alpha:1},
  Transparent:{red:0,green:0,blue:0,alpha:0}
});

/* Browser equivalent of Mojang's nextEvent(): one-shot, cancellable EventTarget wait. */
export function nextEvent(target,type,options={}) {
  let cancel;
  const promise=new Promise(resolve=>{
    if(!target?.addEventListener||!target?.removeEventListener){resolve(undefined);return}
    let settled=false;
    const finish=value=>{if(settled)return;settled=true;target.removeEventListener(type,handler,options);resolve(value)};
    const handler=event=>finish(event);
    target.addEventListener(type,handler,{...options,once:true});
    cancel=()=>finish(undefined);
  });
  promise.cancel=()=>cancel?.();
  return promise;
}
