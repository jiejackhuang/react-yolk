// import React from 'react'
// import ReactDOM from 'react-dom';
import element from './element'

// import render from './15'
// let element1 = ( <
//     div id = "A1" >
//     a1 <
//     div id = "B1" >
//     --b1 <
//     div id = "C1" > -- - c1 < /div> <
//     div id = "C2" > -- - c2 < /div> < /
//     div > <
//     div id = "B2" > --b2 < /div> < /
//     div >
// )
// let element3 = ( <
//     div id = "A1" >
//     <
//     div id = "B1" >
//     <
//     div id = "C1" > < /div> <
//     div id = "C2" > -- - c2 < /div> < /
//     div > <
//     div id = "B2" > --b2 < /div> < /
//     div >
// )
// // console.log(JSON.stringify(element,null,2));
// render(element, document.getElementById('root'))

let container = document.getElementById('root')

const PLACMENT = 'PLACMENT' //插入

let workInProgressRoot = {
    stateNode: container, //此fiber 对应的dom节点
    props: {
        id: 'root',
        children: [element] // fiber属性
    }
    //child return  sibling
}

//下一个工作单元
// fiber其实就是普通的js对象
let nextUnitOfwork = workInProgressRoot

function workloop(deadline) {
    // 如果有当前工作的单元，就执行它，并返回一个工作单元  && deadline.timeRemaining() > 0
    while (nextUnitOfwork) {
        nextUnitOfwork = performanUnitOfWork(nextUnitOfwork)
    }
    if (!nextUnitOfwork) {
        commitRoot()
    }
}

function commitRoot() {
    let currentFiber = workInProgressRoot.firstEffect
    while (currentFiber) {
        // console.log('firstEffect.props.id', currentFiber.props.id)
        if (currentFiber.effectTag === PLACMENT) {
            currentFiber.return.stateNode.appendChild(currentFiber.stateNode)
        }
        currentFiber = currentFiber.nextEffect

    }
    workInProgressRoot = null
}

// beginwork 1.创建此fiber的真实dom 2.通过虚拟dom创建fiber结构   fiber树
function performanUnitOfWork(workingInProgressFiber) {
    beginwork(workingInProgressFiber);
    // 1.创建此fiber的真实dom 2.通过虚拟dom创建fiber结构   fiber树
    // 处理儿子
    if (workingInProgressFiber.child) {
        return workingInProgressFiber.child
    }
    //没有儿子
    while (workingInProgressFiber) {
        //如果没有儿子当前节点其实就结束了
        completeUnitOfWork(workingInProgressFiber)
        if (workingInProgressFiber.sibling) { //有弟弟返回弟弟
            return workingInProgressFiber.sibling
        }
        workingInProgressFiber = workingInProgressFiber.return //借助父亲  就会找到叔叔
    }

}

function beginwork(workingInProgressFiber) {
    if (!workingInProgressFiber.stateNode) {
        // 先创建我们的dom元素
        workingInProgressFiber.stateNode = document.createElement(workingInProgressFiber.type)
        // 然后给他赋属性
        for (let key in workingInProgressFiber.props) {
            if (key !== 'children') {
                workingInProgressFiber.stateNode[key] = workingInProgressFiber.props[key]
            }
        } //不会挂载d的
    }
    console.log("--->: beginwork -> stateNode1111", workingInProgressFiber.props.id);
    let previousFiber
    if (workingInProgressFiber.props && Array.isArray(workingInProgressFiber.props.children)) {
        workingInProgressFiber.props.children.forEach((child, index) => {
            let childFiber = {
                type: child.type,
                props: child.props,
                return: workingInProgressFiber,
                effectTag: PLACMENT, // 这个fiber对应的dom节点需要被插入到页面中 ，插入父dom中去
                nextEffect: null, //下一个有副作用的节点
            }
            if (index === 0) {
                workingInProgressFiber.child = childFiber
            } else {
                previousFiber.sibling = childFiber
            }
            previousFiber = childFiber
        })
    }

}

function completeUnitOfWork(workingInProgressFiber) {
    console.log("--->: completeUnitOfWork -> workingInProgressFiber", workingInProgressFiber.props.id);
    // 构建副作用链条
    let returnFiber = workingInProgressFiber.return;
    if (returnFiber) {
        // 把当前fiber有副作用的changelist  挂到父亲上
        if (!returnFiber.firstEffect) {
            returnFiber.firstEffect = workingInProgressFiber.firstEffect
        }
        if (workingInProgressFiber.lastEffect) {
            if (returnFiber.lastEffect) {
                returnFiber.lastEffect.nextEffect = workingInProgressFiber.firstEffect
            }
            returnFiber.lastEffect = workingInProgressFiber.lastEffect
        }
    }
    // 再把自己挂到后面
    if (workingInProgressFiber.effectTag) {
        if (returnFiber.lastEffect) {
            returnFiber.lastEffect.nextEffect = workingInProgressFiber
        } else {
            returnFiber.firstEffect = workingInProgressFiber
        }
        returnFiber.lastEffect = workingInProgressFiber
    }
}


requestIdleCallback(workloop)


// //  特别深 如果节点多  特别深
// function render(element, parentDOM) {
//     let dom = document.createElement(element.type)
//     Object.keys(element.props).filter(key => key !== 'children')
//         .forEach(key => {
//             dom[key] = element.props[key]
//         })
//     if (Array.isArray(element.props.children)) {
//         element.props.children.forEach(child => render(child, dom))
//     }
//     console.log(dom)
//     parentDOM.appendChild(dom)
// }
// export default render