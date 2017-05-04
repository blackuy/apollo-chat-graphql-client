/* eslint-disable */
// TODO: Fix linter here or move to external dependency

import React, { Component } from 'react'
import autosize from 'autosize'

const updateEvent = 'autosize:update'
const destroyEvent = 'autosize:destroy'
const resizedEvent = 'autosize:resized'

export default class extends Component {

  static defaultProps = {
    rows: 1
  };

  state = {
    maxHeight: null
  }

  componentDidUpdate (prevProps) {
    if (this.getValue(prevProps) !== this.getValue(this.props)) {
      this.dispatchEvent(updateEvent)
    }
  }

  componentDidMount () {
    const { value, defaultValue, onResize } = this.props

    autosize(this.textarea)

    if (this.hasReachedMaxRows(value || defaultValue)) {
      this.updateMaxHeight(value || defaultValue)

      // this trick is needed to force "autosize" to activate the scrollbar
      this.dispatchEvent(destroyEvent)
      setTimeout(() => autosize(this.textarea))
    }

    if (onResize) {
      this.textarea.addEventListener(resizedEvent, this.props.onResize)
    }
  }

  componentWillUnmount () {
    if (this.props.onResize) {
      this.textarea.removeEventListener(resizedEvent, this.props.onResize)
    }
    this.dispatchEvent(destroyEvent)
  }

  dispatchEvent = (EVENT_TYPE, defer) => {
    const event = document.createEvent('Event')
    event.initEvent(EVENT_TYPE, true, false)
    const dispatch = () => this.textarea.dispatchEvent(event)
    if (defer) {
      setTimeout(dispatch)
    } else {
      dispatch()
    }
  };

  hasReachedMaxRows = (value) => {
    const { maxRows } = this.props

    const numberOfRows = (value || '').split('\n').length

    return numberOfRows >= maxRows
  }

  updateMaxHeight = (value) => {
    const {
      props: { maxRows },
      state: { maxHeight }
    } = this

    const hasReachedMaxRows = this.hasReachedMaxRows(value)

    if (!maxHeight && hasReachedMaxRows) {
      const numberOfRows = (value || '').split('\n').length
      const computedStyle = window.getComputedStyle(this.textarea)

      const paddingTop = parseFloat(computedStyle.getPropertyValue('padding-top'), 10)
      const paddingBottom = parseFloat(computedStyle.getPropertyValue('padding-top'), 10)
      const verticalPadding = (paddingTop || 0) + (paddingBottom || 0)

      const borderTopWidth = parseInt(computedStyle.getPropertyValue('border-top-width'), 10)
      const borderBottomWidth = parseInt(computedStyle.getPropertyValue('border-bottom-width'), 10)
      const verticalBorderWidth = (borderTopWidth || 0) + (borderBottomWidth || 0)

      const height = this.textarea.offsetHeight - verticalPadding - verticalBorderWidth

      this.setState({
        maxHeight: height / numberOfRows * maxRows
      })

      return true
    } else if (maxHeight && !hasReachedMaxRows) {
      this.setState({ maxHeight: null })

      return false
    }
  }

  getValue = ({ valueLink, value }) => valueLink ? valueLink.value : value;

  onChange = e => {
    this.updateMaxHeight(e.target.value)
    this.props.onChange && this.props.onChange(e)
  }

  getLocals = () => {
    const {
      props: { onResize, maxRows, onChange, style, ...props }, // eslint-disable-line no-unused-vars
      state: { maxHeight }
    } = this

    return {
      ...props,
      style: maxHeight ? { ...style, maxHeight } : style,
      onChange: this.onChange
    }
  }

  render () {
    const { children, textAreaRef, ...locals } = this.getLocals()

    // return null
    // const textAreaRef = this.props.textAreaRef
    return (
      <textarea {...locals} ref={ref => {
        this.textarea = ref
        if (textAreaRef) {
          textAreaRef(ref)
        }
      }}>
        {children}
      </textarea>
    )
  }
}
