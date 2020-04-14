async function* main(input) {
  const source = share(input)
  for await (const i of source) {
    if (i.type === "pointerdown") {
      const element = i.target.closest(".draggable")
      if (element) {
        const box = element.getBoundingClientRect()
        const x = box.x + window.pageXOffset - i.x
        const y = box.y + +window.pageYOffset - i.y
        for await (const j of source) {
          if (j.type === "pointerup")
            break
          if (j.type === "pointermove") {
            element.style.left = `${j.x + x}px`
            element.style.top = `${j.y + y}px`
          }
          yield j
        }
      }
    }
    yield i
  }
}

let callback
const queue = []

function send(event) {
  if (!queue.length && callback)
    callback()
  queue.push(event)
}

async function* produce() {
  for (; ;) {
    while (queue.length)
      yield queue.shift()
    await new Promise(i => callback = i)
  }
}

async function consume(input) {
  for await(const i of input) {
  }
}

document.addEventListener("pointermove", send, false)
document.addEventListener("pointerdown", send, false)
document.addEventListener("pointerup", send, false)


function share(iterable) {
  const iterator = iterable[Symbol.asyncIterator]()
  return {
    next(value) {
      return iterator.next()
    },
    [Symbol.asyncIterator]() {
      return this
    }
  }
}

consume(main(produce()))
