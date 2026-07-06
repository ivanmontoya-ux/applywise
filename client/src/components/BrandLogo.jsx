import React from 'react'

const baseLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  textDecoration: 'none',
  overflow: 'hidden',
}

export default function BrandLogo({ as: Component = 'div', to, width = 156, style, imgStyle, ...props }) {
  return (
    <Component
      to={to}
      aria-label="ApplyWise"
      style={{ ...baseLinkStyle, ...style }}
      {...props}
    >
      <img
        src="/brand/applywise-logo.png"
        alt="ApplyWise"
        style={{
          display: 'block',
          width,
          height: 'auto',
          maxWidth: '100%',
          objectFit: 'contain',
          ...imgStyle,
        }}
      />
    </Component>
  )
}
