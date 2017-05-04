import React from 'react'
import './Spinners.sass'

export const SnakeCircle = ({ radius = 20, white }) => {
  const boxSize = radius * 4
  return (
    <div className='spinner-react' style={{ width: boxSize, height: boxSize, margin: -radius }}>
      <svg className='circular' style={{ width: boxSize, height: boxSize }}>
        <circle
          className={`path ${white ? 'white' : ''}`}
          cx={(radius * 2)}
          cy={(radius * 2)}
          r={radius}
          fill='none'
          strokeWidth='1'
          strokeMiterlimit='10' />
      </svg>
    </div>
  )
}
