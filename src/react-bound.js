import React, { Component } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash.get'
import set from 'lodash.set'
import { isObservable } from 'mobx'
import { observer } from 'mobx-react'
import dateformat from 'dateformat'

const nodeTypes = ['input', 'select', 'textarea']

const fromInputToModel = (inputType, value) => {
  if (inputType === 'number') return Number(value)
  if (inputType === 'date') {
    const date = new Date(value)
    if (!isFinite(date)) {
      return value
    }
    return date
  }
  if (inputType === 'datetime-local') {
    const date = new Date(value)
    if (!isFinite(date)) {
      return value
    }
    return date
  }
  return value
}

const fromModelToInput = (inputType, value) => {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    if (inputType === 'date') {
      return dateformat(value, 'yyyy-mm-dd')
    }
    if (inputType === 'datetime-local') {
      return value.toJSON().split('Z')[0]
    }
  }
  return value
}

class Bound extends Component {
  componentWillMount () {
    const { to } = this.props
    if (!to.hasOwnProperty('$dirty')) {
      Object.defineProperty(to, '$dirty', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: false
      })
    }
  }
  renderChildren (props, state) {
    const hookNode = node => {
      if (!node) {
        return null
      }
      const { props, type } = node

      const hookOnChangeAndClone = (value, statePropPath) => {
        const originalOnChange = props.onChange
        const cloneProps = {
          onChange: newValueOrEvent => {  // custom onChange events are usually just passing the value directly as first param
            let newValue = newValueOrEvent
            if (newValueOrEvent && typeof newValueOrEvent.target === 'object') {
              // this is a DOM event proxy
              newValue = newValueOrEvent.target.value
            }
            const castedValue = fromInputToModel(props.type, newValue)
            const setValue = () => {
              state.$dirty = true
              set(state, statePropPath, castedValue)
            }
            if (!originalOnChange) {
              return setValue()
            }
            const eventHandlerResult = originalOnChange(newValueOrEvent)
            if (eventHandlerResult !== false) {
              setValue()
            }
            return eventHandlerResult
          },
          value
        }

        const clonedElement = React.cloneElement(node, cloneProps)
        return clonedElement
      }

      if (nodeTypes.includes(type)) {
        if (!props.name) {
          console.warn(`${type} with props ${JSON.stringify(props)} lacks a name and is not bound`)
          return node
        }
        if (props.hasOwnProperty('value')) {
          throw new Error(
            'value prop should not be set for bound elements'
          )
        }
        const value = get(state, props.name)
        // console.log(value)
        if (isObservable(state) && value === undefined) {
          // a safe guard when working with mobx state
          throw new TypeError(
            `path "${props.name}" bound to ${type} lacks a default value`
          )
          // const extender = {}
          // set(extender, props.name, '')
          // extendObservable(state, extender) // fro some reason this won't work
        }
        const castedInputValue = fromModelToInput(props.type, value)
        return hookOnChangeAndClone(castedInputValue, props.name)
      } else {
        if (props) {
          if (props.bound) {
            if (props.hasOwnProperty('value')) {
              throw new Error(
                'value prop should not be set for bound elements'
              )
            }

            const value = get(state, props.bound)
            if (isObservable(state) && value === undefined) {
              throw new TypeError(
                `path "${props.bound}" bound to ${type} lacks a default value`
              )
            }

            return hookOnChangeAndClone(value, props.bound)
          }
          return React.createElement(
            type,
            props,
            this.renderChildren(props, state)
          )
        }

        return node
      }
    }
    if (Array.isArray(props.children)) {
      return React.Children.map(props.children, hookNode)
    }
    return hookNode(props.children)
  }

  render () {
    const { to } = this.props
    return this.renderChildren(this.props, to)
  }
}

Bound.propTypes = {
  to: PropTypes.object.isRequired,
  onChange: PropTypes.func
}

export default observer(Bound)
