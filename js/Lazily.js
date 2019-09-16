const Lazily = (function IIFE(undefined) {
  const dataKey = 'lazily'

  const isSupported = 'IntersectionObserver' in window
    && `MutationObserver` in window

  const mutationObserver = isSupported
    ? new MutationObserver(onMutation)
    : undefined

  const intersectionObserver = isSupported
    ? new IntersectionObserver(onIntersection)
    : undefined

  const intersectionHandlers = new Map(),
    mutationHandlers = []

  function onMutation(entries) {
    entries.forEach(function (entry) {
      [].slice.call(
        entry.addedNodes
      ).forEach(function (node) {
        if (node instanceof Element) {
          initialize(node)
        }
      })
    })
  }

  function initialize(element) {
    if (initializedKey in element.dataset) {
      return
    }

    element.dataset[dataKey] = ''

    mutationHandlers.forEach(function (handler) {
      handler(element)
    })
  }

  function onIntersection(entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const element = entry.target,
          handlers = intersectionHandlers.get(element)

        if (handlers) {
          handlers.forEach(function (handler) {
            handler(element)
          })
        }
      }
    })
  }

  if (isSupported) {
    mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })
  }

  return {
    onMutation: function (handler) {
      if (typeof handler != 'function') {
        throw new Error('Please provide a valid handler function')
      }

      mutationHandlers.push(handler)

      return this
    },
    observeIntersection: function (element, handler) {
      if (!(element instanceof Element)) {
        return this
      }

      if (typeof handler != 'function') {
        throw new Error('Please provide a valid handler function')
      }

      if (!intersectionHandlers.has(element)) {
        intersectionHandlers.set(element, [])
      }

      const handlers = intersectionHandlers.get(element)
      handlers.push(handler)

      return this
    },
    unobserveIntersection: function (element, handler) {
      if (intersectionHandlers.has(element)) {
        const handlers = intersectionHandlers.get(element),
          index = handlers.indexOf(handler)

        if (index != -1) {
          handlers.splice(index, 1)
        }
      }

      return this
    },
  }
})()
