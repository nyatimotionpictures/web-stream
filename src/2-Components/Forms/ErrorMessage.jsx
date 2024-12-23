import React from 'react'

const ErrorMessage = ({errors, message}) => {
  return (
    <div className={`${errors ? "flex" : "hidden"} text-[red] font-[Segoe-UI] text-sm`}>
        <p>{message}</p>
    </div>
  )
}

export default ErrorMessage