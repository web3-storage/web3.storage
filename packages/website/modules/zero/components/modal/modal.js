import clsx from 'clsx'
import { useCallback } from 'react';
import Button from 'ZeroComponents/button/button'

import styles from './modal.module.scss';

/**
 * @typedef {Object} ModalProps
 * @prop {string} [className]
 * @prop { [boolean, Dispatch<SetStateAction<boolean>>] } [modalState]
 * @prop {boolean} [showCloseButton]
 * @prop {ReactComponent} [closeIcon]
 * @prop {import('react').ReactNode | string} children
 */

const Modal = ({
  className,
  modalState,
  showCloseButton,
  closeIcon,
  children
}) => {
  const [isOpen, setModalOpen] = modalState;

  const closeModal = useCallback(() => setModalOpen(false), [])

  return (isOpen &&
    <>
      <div className={clsx(className, styles.modalBackground)}></div>
      <div className={clsx(className, styles.modalContainer)}>
        <div className={clsx(className, styles.modal)}>
          {children}
          {showCloseButton && (
            <Button onClick={closeModal} className={styles.modalClose}>
              {closeIcon 
                ? closeIcon
                : <span>&times;</span>
              }
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

Modal.defaultProps = {
  modalState: null,
  showCloseButton: true
}

export default Modal
