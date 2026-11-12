import { useEffect, useState } from 'react'
import styles from './Modal.module.css'
import { CloseIcon } from '../icons/Icons'

// closeOnOverlayClick={false} keeps long forms open when the dark overlay is clicked by mistake
const Modal = ({ open, title, onClose, children, width = 620, closeOnOverlayClick = true, animateClose = false }) => {
  const [isVisible, setIsVisible] = useState(open)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setIsVisible(true)
      setIsClosing(false)
      return
    }

    if (!isVisible || !animateClose) {
      setIsVisible(false)
      setIsClosing(false)
      return
    }

    setIsClosing(true)
    const timeout = window.setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
    }, 180)

    return () => window.clearTimeout(timeout)
  }, [open, isVisible, animateClose])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open && (!animateClose || !isVisible)) return null

  const closing = isClosing && !open

  return (
    <div
      className={`${styles.overlay} ${closing ? styles.overlayClosing : ''}`}
      aria-hidden={closing}
      onMouseDown={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        className={`${styles.dialog} ${closing ? styles.dialogClosing : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: width }}
      >
        <header className={styles.head}>
          <h2>{title}</h2>
          <button
            type="button"
            className={styles.close}
            aria-label="Close dialog"
            onClick={() => onClose?.()}
          >
            <CloseIcon width={18} height={18} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}

export default Modal
