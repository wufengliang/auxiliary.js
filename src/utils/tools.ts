/*
 * @Author: wufengliang 44823912@qq.com
 * @Date: 2024-04-01 14:42:17
 * @LastEditTime: 2024-04-01 17:54:36
 * @Description: 
 */

/**
 * 判断是否是html节点
 * @param {unknown} element 节点
 * @returns 
 */
export function isHTMLNode(element: unknown) {
    return element instanceof Node && element.nodeType === Node.ELEMENT_NODE;
}

/**
 * 获取图片的真实高度
 * @param {String} url 图片url
 */
export async function getImageInfo(url: string): Promise<{ width: number, height: number, url: string }> {
    return new Promise(resolve => {
        const image = document.createElement('img');
        image.src = url;
        image.onload = function () {
            const { naturalWidth: width, naturalHeight: height } = image;
            resolve({ width, height, url });
        }
    })
}