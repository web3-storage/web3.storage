import clsx from 'clsx';
import { useCallback } from 'react';

import Button from 'ZeroComponents/button/button';

/**
 * @typedef {Object} ModalProps
 * @prop {string} [className]
 * @prop { [boolean, React.Dispatch<React.SetStateAction<boolean>>] } modalState
 * @prop {boolean} [showCloseButton]
 * @prop {React.ReactNode} [closeIcon]
 * @prop {() => void} [onClose]
 * @prop {import('react').ReactNode | string} children
 */

/**
 *
 * @param {ModalProps} props
 */
const Modal = ({ className, modalState, showCloseButton, closeIcon, children, onClose }) => {
  const [isOpen, setModalOpen] = modalState;

  const closeModal = useCallback(() => {
    setModalOpen(false);
    onClose?.();
  }, [setModalOpen, onClose]);

  return isOpen ? (
    <>
      <div className={clsx(className, 'modalBackground')}></div>
      <div className="modalContainer">
        <div className="modal">{children}</div>
        {showCloseButton && (
          <Button onClick={closeModal} className="modalClose">
            {closeIcon && <span>&times;</span>}
          </Button>
        )}
      </div>
    </>
  ) : null;
};

Modal.defaultProps = {
  modalState: null,
  showCloseButton: true,
};

export default Modal;
