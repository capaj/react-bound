import React, { Component } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash.get'
import set from 'lodash.set'
import cloneDeep from 'lodash.clonedeep'
import merge from 'lodash.merge'
import { isObservable, toJS } from 'mobx'
import { observer } from 'mobx-react'
import dateformat from 'dateformat'

const nodeTypes = ['input', 'select', 'textarea']
const ignoredInputTypes = ['reset', 'submit']
const formExtraStates = new WeakMap()

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
  getExtraState () {
    const { to } = this.props
    let extraState = formExtraStates.get(to)
    if (!extraState) {
      extraState = {
        reset: () => {
          merge(to, extraState.cleanState)
          extraState.dirty = false
          extraState.instances.forEach((instance) => instance.forceUpdate())
        },
        dirty: false,
        instances: [this]
      }
      if (isObservable(to)) {
        extraState.cleanState = toJS(to)
      } else {
        extraState.cleanState = cloneDeep(to)
      }
      formExtraStates.set(to, extraState)
    } else {
      extraState.instances.push(this)
    }
    return extraState
  }
  componentWillUnmount () {
    const extraState = formExtraStates.get(this.props.to)
    extraState.instances.splice(extraState.instances.indexOf(this), 1)
  }

  renderAndHookChildren (props, state, first) {
    const hookNode = node => {
      if (!node) {
        return null
      }
      const { props, type } = node

      const hookOnChangeAndClone = (value, statePropPath) => {
        const originalOnChange = props.onChange
        const cloneProps = {
          onChange: newValueOrEvent => {
            // custom onChange events are usually just passing the value directly as first param
            let newValue = newValueOrEvent
            if (newValueOrEvent && typeof newValueOrEvent.target === 'object') {
              // this is a DOM event proxy
              const { target } = newValueOrEvent

              if (target.type === 'checkbox') {
                newValue = target.checked
              } else if (target.type === 'file') {
                newValue = target.files
              } else {
                newValue = target.value
              }
            }
            const castedValue = fromInputToModel(props.type, newValue)
            const setValue = () => {
              const extraState = formExtraStates.get(state)

              if (!extraState.dirty) {
                extraState.dirty = true
                extraState.instances.forEach((instance) => instance.forceUpdate())
              }

              set(state, statePropPath, castedValue)
              props.onChange &&
                props.onChange(state, statePropPath, castedValue)
            }
            if (!originalOnChange) {
              return setValue()
            }
            const eventHandlerResult = originalOnChange(newValueOrEvent)
            if (eventHandlerResult !== false) {
              setValue()
            }
            return eventHandlerResult
          }
        }
        if (props.type === 'checkbox') {
          cloneProps.checked = value
        } else if (props.type === 'radio') {
          if (props.value === value) {
            cloneProps.checked = true
          } else {
            cloneProps.checked = false
          }
        } else if (props.type === 'file') {
          // file input cannot be a controlled
        } else {
          cloneProps.value = value
        }

        const clonedElement = React.cloneElement(node, cloneProps)
        return clonedElement
      }

      if (nodeTypes.includes(type)) {
        if (ignoredInputTypes.includes(props.type)) {
          return node
        }
        if (!props.name) {
          console.warn(
            `${type} with props ${JSON.stringify(
              props
            )} lacks a name and is not bound`
          )
          return node
        }
        if (props.type !== 'radio' && props.hasOwnProperty('value')) {
          throw new Error(`value prop cannot be set for bound elements, yet it is value="${props.value}" for ${type}`)
        }
        const value = get(state, props.name)

        if (isObservable(state) && value === undefined) {
          // a safe guard when working with mobx state
          throw new TypeError(
            `path "${props.name}" bound to ${type} lacks a default value`
          )
        }
        const castedInputValue = fromModelToInput(props.type, value)
        return hookOnChangeAndClone(castedInputValue, props.name)
      } else {
        if (props) {
          if (props.bound) {
            if (props.hasOwnProperty('value')) {
              throw new Error('value prop should not be set for bound elements')
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
            this.renderAndHookChildren(props, state)
          )
        }

        return node
      }
    }
    let { children } = props
    if (first && typeof children === 'function') {
      let extraState = this.getExtraState()

      children = children(extraState.dirty, extraState.reset)
    }
    if (Array.isArray(children)) {
      return React.Children.map(children, hookNode)
    }
    return hookNode(children)
  }

  render () {
    const { to } = this.props

    return this.renderAndHookChildren(this.props, to, true)
  }
}

Bound.propTypes = {
  to: PropTypes.object.isRequired,
  onChange: PropTypes.func
}

export default observer(Bound)
