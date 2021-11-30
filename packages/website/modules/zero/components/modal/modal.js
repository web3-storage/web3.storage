import clsx from 'clsx'
import { useCallback } from 'react';
import Button from 'ZeroComponents/button/button'

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
      <div className={clsx(className, 'modalBackground')}></div>
      <div className="modalContainer">
        <div className="modal">
          {children}
        </div>
        {showCloseButton && (
          <Button onClick={closeModal} className="modalClose">
            {closeIcon 
              ? closeIcon
              : <span>&times;</span>
            }
          </Button>
        )}
      </div>
    </>
  )
}

Modal.defaultProps = {
  modalState: null,
  showCloseButton: true
}

export default Modal
