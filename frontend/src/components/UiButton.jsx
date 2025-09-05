import React from 'react'

export default function UiButton({ children, className = '', onClick, type = 'button', ...props }) {
    // Render a native button so project CSS classes (like .submit-button) apply reliably.
    return (
        <button className={className} onClick={onClick} type={type} {...props}>
            {children}
        </button>
    )
}
