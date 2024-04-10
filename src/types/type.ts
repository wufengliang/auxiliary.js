/*
 * @Author: wufengliang 44823912@qq.com
 * @Date: 2024-04-01 14:02:33
 * @LastEditTime: 2024-04-10 16:18:33
 * @Description: 
 */

import type AuxiliaryImage from "@/lib/image";

export interface IPoint {
    x: number,
    y: number,
    left?: number,
    top?: number,
}

export interface IPointType {
    //  x轴起始位置
    x1: number,
    //  x轴居中位置
    x2: number,
    //  x轴结束位置
    x3: number,
    //  y轴起始位置
    y1: number,
    //  y轴居中位置
    y2: number,
    //  y轴结束位置
    y3: number,
}

/**
 * 导入图片数据
 */
export interface INormalItem {
    //  图片数据源: base64 或 网络图片 
    url: string,
    //  图片宽度
    width?: number,
    //  图片宽度
    height?: number,
    //  距离父容器节点top值
    top?: number,
    //  距离父容器节点left值
    left?: number,
}

export interface ISingleItem extends INormalItem {
    //  图片横向节点
    rowPoints?: [number, number, number],
    //  图片纵向节点
    columnPoints?: [number, number, number],
}

/**
 * 图片节点
 */
export interface IImageNodeItem extends ISingleItem {
    parentNode: HTMLElement;
}

/**
 * 初始化应用数据
 */
export interface IOptions {
    //  数据源
    list: INormalItem[],
    //  创建容器宽度
    width: number,
    //  创建容器高度
    height: number,
    //  创建容器插入到界面节点展示
    container?: HTMLElement,
}

export interface ICheckPointType {
    type: 'row' | 'column',
    value: number,
}

export interface INodeProps {
    node?: AuxiliaryImage,
    observer?: MutationObserver
}

export enum KEY_BOARD_ENUM {
    ARROW_UP = 'ArrowUp',   //  向上
    ARROW_DOWN = 'ArrowDown',   //  向下
    ARROW_LEFT = 'ArrowLeft', //  向左
    ARROW_RIGHT = 'ArrowRight',   //  向右
}