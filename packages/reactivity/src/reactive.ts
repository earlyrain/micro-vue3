import { isObject } from "@vue/shared";
import { mutableHandlers } from "./baseHandlers";

export const enum ReactiveFlags {
  // 是否是reactive的标识。通过其来判断是否被proxy代理过。否则需要改写[Symbol.toStringTag]值才方便判断。
  // 没有赋值操作，是在代理的get函数中判断的。
  IS_REACTIVE = "__v_isReactive",

  // 原始对象标识
  RAW = '__v_raw'
}

export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean;

  [ReactiveFlags.RAW]?: any;
}

export const reactiveMap = new WeakMap<Target, any>();

// export function reactive<T extends object>(target: T): ProxyConstructor;
export function reactive(target) {
  return createReactive(target, mutableHandlers, reactiveMap);
}

function createReactive(
  target: any,
  baseHandlers: ProxyHandler<any>,
  proxyMap
) {
  // 如果不是对象，直接返回
  if (!isObject(target)) {
    return target;
  }

  // 如果已经是响应式对象，直接返回
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  // 已在Map中缓存的直接使用
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }

  // 使用proxy代理
  const proxy = new Proxy(target, baseHandlers);
  // 存储到Map中
  proxyMap.set(target, proxy);

  return proxy;
}

export function isReactive(value): boolean {
  // 转为布尔值
  return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}

export function toRaw(observed) {
  // 如果包含__v_raw 就取里面的原始值
  // ？？？ 源码中有处理多层代理嵌套的情况，不清楚什么时候会出现
  // return observed[ReactiveFlags.RAW] ? observed[ReactiveFlags.RAW] : observed;
  return (observed && observed[ReactiveFlags.RAW]) || observed;
}

// 如果是对象，转化为proxy
export const toReactive = <T extends unknown>(value: T): T =>
 isObject(value) ? reactive(value) : value;
