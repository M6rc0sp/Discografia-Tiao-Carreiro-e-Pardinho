import React from 'react'
import Button from '@mui/material/Button'

export default function UiButton({ children, className = '', onClick, type = 'button', ...props }) {
    // Decide MUI variant from className so outline/solid mapping matches CSS
    const isOutline = String(className).includes('outline')
    const variant = isOutline ? 'outlined' : 'contained'

    return (
        <Button className={className} onClick={onClick} type={type} variant={variant} {...props} disableElevation>
            {children}
        </Button>
    )
}
