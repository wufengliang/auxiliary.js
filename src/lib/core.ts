/*
 * @Author: wufengliang 44823912@qq.com
 * @Date: 2024-04-01 11:44:42
 * @LastEditTime: 2024-04-10 16:17:36
 * @Description: 核心实现逻辑
 */

import { IOptions, INormalItem, ICheckPointType, INodeProps, ISingleItem } from '../types';
import { isHTMLNode, getImageInfo } from '../utils/tools';
import AuxiliaryImage from './image';

export class AuxiliaryCore {
    /**
     * 初始化参数
     */
    private options: IOptions;
    /**
     * 存储容器
     */
    protected container?: HTMLElement;
    /**
     * 数据源
     */
    protected list?: ISingleItem[];
    /**
     * 存储数据源
     */
    protected saveContainerMap: { [key: string]: HTMLElement } = {};
    /**
     * 当前创建的容器节点
     */
    protected currentSaveContainer?: HTMLElement;
    /**
     * 创建的图片节点
     */
    private imgNodes: { [key: string]: INodeProps } = {};

    /**
     * 横向垂直节点
     */
    private rowNode?: HTMLElement;
    /**
     * 纵向垂直节点
     */
    private columnNode?: HTMLElement;


    constructor(options: IOptions) {
        this.options = options;
        this.checkOptions();
    }

    /**
     * 校验参数
     */
    protected checkOptions() {
        const { width, height, list, container = document.body, } = this.options;
        if (!width || !height) {
            throw new Error(`缺失width或height参数`);
        }

        if (!isHTMLNode(container)) {
            throw new Error(`container非html节点`);
        }
        this.container = container;
        this.list = list;
        this.createContainer(width, height);
    }

    /**
     * 创建节点
     * @param {Number} width 宽度
     * @param {Number} height 高度
     */
    protected createContainer(width: number, height: number) {
        const div = document.createElement('div');
        div.style.cssText = `width:${width}px;height:${height}px;position:relative;`;
        this.currentSaveContainer = div;
        this.container?.appendChild(div);
        this.createNode();
        this.loadData();
    }

    /**
     * 创建横向、纵向节点
     */
    private createNode() {
        const div = document.createElement('div');
        this.rowNode = div.cloneNode() as HTMLElement;
        this.columnNode = div.cloneNode() as HTMLElement
        this.currentSaveContainer?.appendChild(this.rowNode);
        this.currentSaveContainer?.appendChild(this.columnNode);
    }

    /**
     * 导入数据
     */
    protected async loadData() {
        if (!this.list) {
            return;
        }
        const newList = await Promise.all(this.list.map(item => this.handleImageData(item)));

        this.list = newList.map((item, index) => {
            const { width = 0, height = 0, url, top = 0, left = 0, rowPoints, columnPoints } = item as ISingleItem;
            return {
                width: this.list?.[index].width || width,
                height: this.list?.[index].height || height,
                url,
                rowPoints: rowPoints || [0 + left, width / 2 + left, width + left],
                columnPoints: columnPoints || [0 + top, height / 2 + top, height + top],
                left,
                top,
            }
        });
        this.createImageNode();
    }

    /**
     * 重新处理数据
     * @param {INormalItem} options 单项配置
     */
    protected async handleImageData(options: INormalItem): Promise<INormalItem> {
        if (options.width && options.height) {
            return options;
        }
        const result = await getImageInfo(options.url);
        return { ...options, ...result };
    }

    /**
     * 根据数据源创建image节点
     */
    private createImageNode() {
        if (!this.currentSaveContainer) {
            throw new Error('当前创建的节点不存在...');
        }
        this.list?.map((item, index) => {
            const auxiliaryImage = new AuxiliaryImage({ ...item, parentNode: this.currentSaveContainer! });
            this.observerNode(auxiliaryImage, index);
            if (!this.imgNodes[item.url]) {
                this.imgNodes[item.url] = { node: undefined, observer: undefined };
            }
            this.imgNodes[item.url].node = auxiliaryImage;
        })
    }

    /**
     * 删除图片节点 
     * @param {String} key 图片节点表示
     */
    public removeImageNode(key?: string) {
        if (!key) {
            Object.keys(this.imgNodes).forEach(name => {
                this.imgNodes[name]?.node?.destory();
                this.imgNodes[name]?.observer?.disconnect();
            })
            return;
        }
        this.imgNodes[key]?.node?.destory();
        this.imgNodes[key]?.observer?.disconnect();
    }

    /**
     * 监听子节点变化
     * @param {AuxiliaryImage} instance
     * @param {Number} index 索引
     */
    private observerNode(instance: AuxiliaryImage, index: number) {
        const observer = new MutationObserver(() => {
            const { options } = instance;
            this.list![index] = options;
            const imgNodesList = Object.values(this.imgNodes);
            this.operateLine(imgNodesList, instance);

        });
        observer.observe(instance.node!, { attributes: true, attributeFilter: ['style'] });
    }

    /**
     * 虚线操作
     * @param {INodeProps[]} list INodeProps数据集合
     * @param {AuxiliaryImage} 当前变化的实力
     */
    private operateLine(list: INodeProps[], instance: AuxiliaryImage,) {
        const { startPoint } = instance;
        const { left = 0, top = 0 } = startPoint;
        const auxiliaryImages = list.filter(i => i.node !== instance).map(i => i.node!);
        const rowBool = this.checkHasSamePoint(auxiliaryImages, { type: 'row', value: left });
        const columnBool = this.checkHasSamePoint(auxiliaryImages, { type: 'column', value: top });
        this.createDashedLine({ type: 'row', value: left }, rowBool);
        this.createDashedLine({ type: 'column', value: top }, columnBool);
    }

    /**
     * 创建节点虚线
     * @param {ICheckPointType} options 配置
     * @param {Boolean} isShow 是否显示
     */
    private createDashedLine(options: ICheckPointType, isShow: boolean) {
        const { type } = options;
        const cssText = this.createStyle(options);
        if (type === 'row') {
            this.rowNode!.style.cssText = isShow ? cssText : ''
        }

        if (type === 'column') {
            this.columnNode!.style.cssText = isShow ? cssText : ''
        }
    }

    /**
     * 创建样式
     * @param {ICheckPointType} options 配置
     */
    private createStyle(options: ICheckPointType): string {
        const { type, value } = options;
        const { width, height } = this.options;
        const commonStyle = `position:absolute;border-color:#f00;border-style:dotted;z-index:9999;`;
        const style = type === 'row' ? `border-right-width:1px;width:0;height:${height}px;left:${value}px` : `border-bottom-width:1px;width:${width}px;height:0;top:${value}px;`;
        return commonStyle + style;
    }

    /**
     * 校验当前是否有节点相同
     * @param {AuxiliaryImage} list 需要匹配的对象借点
     * @param {ICheckPointType} options 配置
     */
    private checkHasSamePoint(list: AuxiliaryImage[], options: ICheckPointType) {
        const { type, value } = options;
        const newArray = (list || []).map(item => type === 'row' ? (item.options.rowPoints ?? []) : (item.options.columnPoints ?? [])).flat();
        return newArray.filter(item => item === value).length > 0;
    }
}
