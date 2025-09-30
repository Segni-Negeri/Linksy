import * as React from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKeyDown)
      // focus trap: focus the dialog when opened
      setTimeout(() => dialogRef.current?.focus(), 0)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const maxWidth = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  }[size]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative z-10 w-full ${maxWidth} mx-4 rounded-lg bg-white shadow-xl border border-slate-200`}
      >
        {title && (
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
        )}

        <div className="px-6 py-4">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-lg">
            <div className="flex items-center justify-end gap-3">{footer}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal


