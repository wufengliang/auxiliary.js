/*
 * @Author: wufengliang 44823912@qq.com
 * @Date: 2024-04-07 11:38:57
 * @LastEditTime: 2024-04-10 15:57:31
 * @Description: 
 */
import { IImageNodeItem, IPoint, KEY_BOARD_ENUM } from "../types";

export default class AuxiliaryImage {
    static activityNode: HTMLElement | null;
    /**
     * image节点
     */
    private el: HTMLElement | null = null;

    /**
     * 手势是否按下
     */
    public isDown: boolean = false;
    /**
     * 起始坐标
     */
    public startPoint: IPoint = { x: 0, y: 0, left: 0, top: 0 };
    /**
     * 层级
     */
    public zIndex: number = 0;

    constructor(public options: IImageNodeItem) {
        const { left = 0, top = 0 } = options;
        this.startPoint = { ...this.startPoint, left, top };
        this.init();
    }

    get node(): HTMLElement | null {
        return this.el;
    }

    get parentNodePosition(): DOMRect {
        return this.options.parentNode.getBoundingClientRect();
    }

    /**
     * 初始化
     */
    protected init() {
        const { width, height, url, parentNode, left = 0, top = 0, } = this.options;
        const imageNode = this.el = document.createElement('img');
        imageNode.src = url;
        imageNode.width = width!;
        imageNode.height = height!;
        imageNode.style.cssText = `width:${width}px;height:${height}px`;
        parentNode.appendChild(imageNode);
        this.setNodeCssText(left, top);
        this.listenChange();
    }

    /**
     * 更新坐标节点
     */
    private updatePoint() {
        const { left = 0, top = 0 } = this.startPoint;
        const { width = 0, height = 0 } = this.options;
        let { rowPoints = [], columnPoints = [], } = this.options;
        rowPoints = [left, width / 2 + left, width + left];
        columnPoints = [top, height / 2 + top, height + top];
        Object.assign(this.options, { rowPoints, columnPoints });
    }

    /**
     * 设置节点的cssText
     * @param {Number} left 左边距
     * @param {Number} top 上边距
     */
    private setNodeCssText(left: number, top: number) {
        if (!this.el) {
            return;
        }
        const isCurrentNode = AuxiliaryImage.activityNode === this.el || this.isDown;
        this.zIndex = this.isDown || AuxiliaryImage.activityNode === this.el ? 1 : 0;

        Object.assign(this.startPoint, { left, top });
        const cssText = `box-sizing:border-box;position:absolute;left:${left}px;top:${top}px;z-index:${this.zIndex};${isCurrentNode ? 'border:1px solid #000' : null}`;
        this.el!.style.cssText = cssText;
        this.updatePoint();
    }

    /**
     * 监听节点拖转操作
     */
    protected listenChange() {
        if (!this.el) {
            throw new Error(`当前未生成image节点，无法操作`);
        }
        this.el.addEventListener('pointerdown', this.mouseDown.bind(this), false);
        window.addEventListener('keydown', this.keyboardEvent.bind(this), false);
        document.addEventListener('pointermove', this.mouseMove.bind(this), false);
        document.addEventListener('pointerup', this.mouseUp.bind(this), false);
    }

    /**
     * 键盘按下事件
     */
    private keyboardEvent(e: KeyboardEvent) {
        if (AuxiliaryImage.activityNode !== this.el) {
            return;
        }
        let { left = 0, top = 0, } = this.startPoint;
        const { key } = e;
        switch (key) {
            case KEY_BOARD_ENUM.ARROW_UP:
                //  向上
                top -= 1;
                break;
            case KEY_BOARD_ENUM.ARROW_DOWN:
                //  向下
                top += 1;
                break;
            case KEY_BOARD_ENUM.ARROW_LEFT:
                left -= 1;
                break;
            case KEY_BOARD_ENUM.ARROW_RIGHT:
                left += 1;
        }
        Object.assign(this.startPoint, { left, top });
        this.computedPosition(left, top);
    }

    /**
     * 手势按下
     */
    protected mouseDown(e: MouseEvent) {
        AuxiliaryImage.activityNode = this.el;
        const { clientX, clientY } = e;
        this.startPoint = { ...this.startPoint, x: clientX, y: clientY, };
        this.isDown = true;
    }

    /**
     * 手势移动
     */
    protected mouseMove(e: MouseEvent) {
        if (!this.isDown) {
            return;
        }
        this.normalMove(e);
    }

    /**
     * PC端移动事件
     */
    protected normalMove(e: MouseEvent) {
        const { clientX, clientY } = e;
        const { x, y } = this.startPoint;
        const { left = 0, top = 0, } = this.options;
        const newLeft = clientX - x + left,
            newTop = clientY - y + top;
        this.computedPosition(newLeft, newTop);
        e.preventDefault();
    }

    computedPosition(newLeft: number, newTop: number) {
        const { width, height } = this.parentNodePosition;
        const { width: imgWidth = 0, height: imgHeight = 0 } = this.options;
        if (newLeft <= 0) {
            newLeft = 0;
        }

        if (newTop <= 0) {
            newTop = 0;
        }

        if (newLeft + imgWidth >= width) {
            newLeft = width - imgWidth;
        }

        if (newTop + imgHeight >= height) {
            newTop = height - imgHeight;
        }
        this.setNodeCssText(parseInt(`${newLeft}`), parseInt(`${newTop}`));
    }

    /**
     * 手势抬起
     */
    protected mouseUp() {
        this.isDown = false;
        const { left = 0, top = 0 } = this.startPoint;
        Object.assign(this.options, { left, top });
        this.setNodeCssText(left, top);
    }

    /**
     * 节点销毁
     */
    public destory() {
        if (!this.el) {
            return;
        }
        this.el.removeEventListener('mousedown', this.mouseDown.bind(this), false);
        document.removeEventListener('mousemove', this.mouseDown.bind(this), false);
        document.removeEventListener('mouseup', this.mouseUp.bind(this), false);
        this.options.parentNode.removeChild(this.el);
        this.el = null;
    }
}