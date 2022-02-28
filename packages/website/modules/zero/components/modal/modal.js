import clsx from 'clsx';
import { useCallback, useEffect } from 'react';

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

  useEffect(() => {
    const onKeyPress = ({ key }) => key.toLowerCase() === 'escape' && closeModal();

    if (isOpen) {
      document.addEventListener('keyup', onKeyPress);
    } else {
      document.removeEventListener('keyup', onKeyPress);
    }

    return () => {
      document.removeEventListener('keyup', onKeyPress);
    };
  }, [isOpen, closeModal]);

  return isOpen ? (
    <>
      <button className={clsx(className, 'modalBackground')} onClick={closeModal} />
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
