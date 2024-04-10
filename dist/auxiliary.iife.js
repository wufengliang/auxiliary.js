(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.auxiliary = {}));
})(this, (function (exports) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    function isHTMLNode(element) {
        return element instanceof Node && element.nodeType === Node.ELEMENT_NODE;
    }
    function getImageInfo(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                const image = document.createElement('img');
                image.src = url;
                image.onload = function () {
                    const { naturalWidth: width, naturalHeight: height } = image;
                    resolve({ width, height, url });
                };
            });
        });
    }

    var KEY_BOARD_ENUM;
    (function (KEY_BOARD_ENUM) {
        KEY_BOARD_ENUM["ARROW_UP"] = "ArrowUp";
        KEY_BOARD_ENUM["ARROW_DOWN"] = "ArrowDown";
        KEY_BOARD_ENUM["ARROW_LEFT"] = "ArrowLeft";
        KEY_BOARD_ENUM["ARROW_RIGHT"] = "ArrowRight";
    })(KEY_BOARD_ENUM || (KEY_BOARD_ENUM = {}));

    class AuxiliaryImage {
        constructor(options) {
            this.options = options;
            this.el = null;
            this.isDown = false;
            this.startPoint = { x: 0, y: 0, left: 0, top: 0 };
            this.zIndex = 0;
            const { left = 0, top = 0 } = options;
            this.startPoint = Object.assign(Object.assign({}, this.startPoint), { left, top });
            this.init();
        }
        get node() {
            return this.el;
        }
        get parentNodePosition() {
            return this.options.parentNode.getBoundingClientRect();
        }
        init() {
            const { width, height, url, parentNode, left = 0, top = 0, } = this.options;
            const imageNode = this.el = document.createElement('img');
            imageNode.src = url;
            imageNode.width = width;
            imageNode.height = height;
            imageNode.style.cssText = `width:${width}px;height:${height}px`;
            parentNode.appendChild(imageNode);
            this.setNodeCssText(left, top);
            this.listenChange();
        }
        updatePoint() {
            const { left = 0, top = 0 } = this.startPoint;
            const { width = 0, height = 0 } = this.options;
            let { rowPoints = [], columnPoints = [], } = this.options;
            rowPoints = [left, width / 2 + left, width + left];
            columnPoints = [top, height / 2 + top, height + top];
            Object.assign(this.options, { rowPoints, columnPoints });
        }
        setNodeCssText(left, top) {
            if (!this.el) {
                return;
            }
            const isCurrentNode = AuxiliaryImage.activityNode === this.el || this.isDown;
            this.zIndex = this.isDown || AuxiliaryImage.activityNode === this.el ? 1 : 0;
            Object.assign(this.startPoint, { left, top });
            const cssText = `box-sizing:border-box;position:absolute;left:${left}px;top:${top}px;z-index:${this.zIndex};${isCurrentNode ? 'border:1px solid #000' : null}`;
            this.el.style.cssText = cssText;
            this.updatePoint();
        }
        listenChange() {
            if (!this.el) {
                throw new Error(`当前未生成image节点，无法操作`);
            }
            this.el.addEventListener('pointerdown', this.mouseDown.bind(this), false);
            window.addEventListener('keydown', this.keyboardEvent.bind(this), false);
            document.addEventListener('pointermove', this.mouseMove.bind(this), false);
            document.addEventListener('pointerup', this.mouseUp.bind(this), false);
        }
        keyboardEvent(e) {
            if (AuxiliaryImage.activityNode !== this.el) {
                return;
            }
            let { left = 0, top = 0, } = this.startPoint;
            const { key } = e;
            switch (key) {
                case KEY_BOARD_ENUM.ARROW_UP:
                    top -= 1;
                    break;
                case KEY_BOARD_ENUM.ARROW_DOWN:
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
        mouseDown(e) {
            AuxiliaryImage.activityNode = this.el;
            const { clientX, clientY } = e;
            this.startPoint = Object.assign(Object.assign({}, this.startPoint), { x: clientX, y: clientY });
            this.isDown = true;
        }
        mouseMove(e) {
            if (!this.isDown) {
                return;
            }
            this.normalMove(e);
        }
        normalMove(e) {
            const { clientX, clientY } = e;
            const { x, y } = this.startPoint;
            const { left = 0, top = 0, } = this.options;
            const newLeft = clientX - x + left, newTop = clientY - y + top;
            this.computedPosition(newLeft, newTop);
            e.preventDefault();
        }
        computedPosition(newLeft, newTop) {
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
        mouseUp() {
            this.isDown = false;
            const { left = 0, top = 0 } = this.startPoint;
            Object.assign(this.options, { left, top });
            this.setNodeCssText(left, top);
        }
        destory() {
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

    class AuxiliaryCore {
        constructor(options) {
            this.saveContainerMap = {};
            this.imgNodes = {};
            this.options = options;
            this.checkOptions();
        }
        checkOptions() {
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
        createContainer(width, height) {
            var _a;
            const div = document.createElement('div');
            div.style.cssText = `width:${width}px;height:${height}px;position:relative;`;
            this.currentSaveContainer = div;
            (_a = this.container) === null || _a === void 0 ? void 0 : _a.appendChild(div);
            this.createNode();
            this.loadData();
        }
        createNode() {
            var _a, _b;
            const div = document.createElement('div');
            this.rowNode = div.cloneNode();
            this.columnNode = div.cloneNode();
            (_a = this.currentSaveContainer) === null || _a === void 0 ? void 0 : _a.appendChild(this.rowNode);
            (_b = this.currentSaveContainer) === null || _b === void 0 ? void 0 : _b.appendChild(this.columnNode);
        }
        loadData() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.list) {
                    return;
                }
                const newList = yield Promise.all(this.list.map(item => this.handleImageData(item)));
                this.list = newList.map((item, index) => {
                    var _a, _b;
                    const { width = 0, height = 0, url, top = 0, left = 0, rowPoints, columnPoints } = item;
                    return {
                        width: ((_a = this.list) === null || _a === void 0 ? void 0 : _a[index].width) || width,
                        height: ((_b = this.list) === null || _b === void 0 ? void 0 : _b[index].height) || height,
                        url,
                        rowPoints: rowPoints || [0 + left, width / 2 + left, width + left],
                        columnPoints: columnPoints || [0 + top, height / 2 + top, height + top],
                        left,
                        top,
                    };
                });
                this.createImageNode();
            });
        }
        handleImageData(options) {
            return __awaiter(this, void 0, void 0, function* () {
                if (options.width && options.height) {
                    return options;
                }
                const result = yield getImageInfo(options.url);
                return Object.assign(Object.assign({}, options), result);
            });
        }
        createImageNode() {
            var _a;
            if (!this.currentSaveContainer) {
                throw new Error('当前创建的节点不存在...');
            }
            (_a = this.list) === null || _a === void 0 ? void 0 : _a.map((item, index) => {
                const auxiliaryImage = new AuxiliaryImage(Object.assign(Object.assign({}, item), { parentNode: this.currentSaveContainer }));
                this.observerNode(auxiliaryImage, index);
                if (!this.imgNodes[item.url]) {
                    this.imgNodes[item.url] = { node: undefined, observer: undefined };
                }
                this.imgNodes[item.url].node = auxiliaryImage;
            });
        }
        removeImageNode(key) {
            var _a, _b, _c, _d;
            if (!key) {
                Object.keys(this.imgNodes).forEach(name => {
                    var _a, _b, _c, _d;
                    (_b = (_a = this.imgNodes[name]) === null || _a === void 0 ? void 0 : _a.node) === null || _b === void 0 ? void 0 : _b.destory();
                    (_d = (_c = this.imgNodes[name]) === null || _c === void 0 ? void 0 : _c.observer) === null || _d === void 0 ? void 0 : _d.disconnect();
                });
                return;
            }
            (_b = (_a = this.imgNodes[key]) === null || _a === void 0 ? void 0 : _a.node) === null || _b === void 0 ? void 0 : _b.destory();
            (_d = (_c = this.imgNodes[key]) === null || _c === void 0 ? void 0 : _c.observer) === null || _d === void 0 ? void 0 : _d.disconnect();
        }
        observerNode(instance, index) {
            const observer = new MutationObserver(() => {
                const { options } = instance;
                this.list[index] = options;
                const imgNodesList = Object.values(this.imgNodes);
                this.operateLine(imgNodesList, instance);
            });
            observer.observe(instance.node, { attributes: true, attributeFilter: ['style'] });
        }
        operateLine(list, instance) {
            const { startPoint } = instance;
            const { left = 0, top = 0 } = startPoint;
            const auxiliaryImages = list.filter(i => i.node !== instance).map(i => i.node);
            const rowBool = this.checkHasSamePoint(auxiliaryImages, { type: 'row', value: left });
            const columnBool = this.checkHasSamePoint(auxiliaryImages, { type: 'column', value: top });
            this.createDashedLine({ type: 'row', value: left }, rowBool);
            this.createDashedLine({ type: 'column', value: top }, columnBool);
        }
        createDashedLine(options, isShow) {
            const { type } = options;
            const cssText = this.createStyle(options);
            if (type === 'row') {
                this.rowNode.style.cssText = isShow ? cssText : '';
            }
            if (type === 'column') {
                this.columnNode.style.cssText = isShow ? cssText : '';
            }
        }
        createStyle(options) {
            const { type, value } = options;
            const { width, height } = this.options;
            const commonStyle = `position:absolute;border-color:#f00;border-style:dotted;z-index:9999;`;
            const style = type === 'row' ? `border-right-width:1px;width:0;height:${height}px;left:${value}px` : `border-bottom-width:1px;width:${width}px;height:0;top:${value}px;`;
            return commonStyle + style;
        }
        checkHasSamePoint(list, options) {
            const { type, value } = options;
            const newArray = (list || []).map(item => { var _a, _b; return type === 'row' ? ((_a = item.options.rowPoints) !== null && _a !== void 0 ? _a : []) : ((_b = item.options.columnPoints) !== null && _b !== void 0 ? _b : []); }).flat();
            return newArray.filter(item => item === value).length > 0;
        }
    }

    exports.AuxiliaryCore = AuxiliaryCore;

}));
