function createElement(type, props, ...children) {
    delete props.__source
    return {
        type,
        props: {
            ...props,
            children: children.map(child => {
                return typeof child === 'object' ? child : createTextElement(child)
            })
        }
    }
}
// 文本类型vdom创建
function createTextElement(text) {
    return {
        type: 'TEXT',
        props: {
            'nodeValue': text,

        }
    }

}
/**
 * 通过虚拟dom，
 * @param {虚拟dom} vdom 
 */
function createDom(vdom) {
    const dom = vdom.type === "TEXT" ?
        document.createTextNode('') :
        document.createElement(vdom.type);

    Object.keys(vdom.props).filter(key => key !== 'children')
        .forEach(name => {
            // @todo 事件处理 属性兼容
            dom[name] = vdom.props[name]
        })
    return dom
}

/**
 * 
 * @param {虚拟dom} vdom 
 * @param {容器 } container 
 */

function render(vdom, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [vdom]
        }
    }
    // fber跟节点
    nextUnitOifWork = wipRoot

    // if (vdom.props.children) {
    //     vdom.props.children.forEach(child => {
    //         render(child, dom)
    //     })
    // }

    // container.appendChild(dom)
    // container.innerHTML = `<pre>${JSON.stringify(vdom,null,2)}</pre>`
}

function commitRoot() {
    commitWorker(wipRoot.child)
    wipRoot = null
}

function commitWorker(fiber) {
    if (!fiber) {
        return

    }
    const domParent = fiber.parent.dom
    domParent.appendChild(fiber.dom)
    commitWorker(fiber.child)
    commitWorker(fiber.slibing)
}

// 下一个单元任务
// render 会初始化第一个任务
let nextUnitOifWork = null
let wipRoot = null
// 调度我们的diff或者渲染任务
function workLoop(deadline) {
    // 有下一个任务 并且 当前帧数 还没有结束
    while (nextUnitOifWork && deadline.timeRemaining() > 1) {
        nextUnitOifWork = performUnitOfWork(nextUnitOifWork)

    }
    if (!nextUnitOifWork && wipRoot) {
        commitRoot()
    }
    requestIdleCalllback(workLoop)
}
// 启动空闲时间渲染
window.requestIdleCalllback(workLoop)

function performUnitOfWork(fiber) {
    // 获取下一个任务
    // 根据当前的任务 ，获取下一个
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom)
    }
    const elements = fiber.props.children
    let index = 0
    let prevSlibing = null
    while (index < elements.length) {
        let element = elements[index]
        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null
        }
        if (index === 0) {
            // 第一个元素   是父亲fiber的child属性
            fiber.child = newFiber
        } else {
            prevSlibing.slibing = newFiber

        }
        prevSlibing = fiber
        index++
        //fiber 基本结构构建完毕
    }
    // 没有子元素了，就找兄弟元素
    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.slibing) {
            return nextFiber.slibing
        }
        // 没有兄弟元素了，就找父元素
        nextFiber = newFiber.parent
    }

}

//变成链表
// fiber = {
//     dom:
//         parent:
//     child:
//     slibing:兄弟
// }

export default {
    render,
    createElement
}