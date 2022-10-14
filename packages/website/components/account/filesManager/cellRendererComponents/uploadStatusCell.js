import { BsFillInfoCircleFill } from 'react-icons/bs';

import Tooltip from 'ZeroComponents/tooltip/tooltip';

export const PinStatus = {
  PINNED: 'Pinned',
  PINNING: 'Pinning',
  PIN_QUEUED: 'PinQueued',
  QUEUING: 'Queuing...',
};

/**
 * @type {import('react').FC}
 * @param {object} props
 * @returns
 */
function uploadStatusTableRenderer({ pins, statusMessages }) {
  if (!pins) {
    return <span></span>;
  }

  const status = Object.values(PinStatus).find(status => pins.some(pin => status === pin.status)) || PinStatus.QUEUING;

  const statusTooltips = {
    [PinStatus.QUEUING]: statusMessages.queuing,
    [PinStatus.PIN_QUEUED]: statusMessages.pin_queued,
    [PinStatus.PINNING]: statusMessages.pinning,
    [PinStatus.PINNED]: statusMessages.pinned.replace('*numberOfPins*', `${pins.length}`),
  };

  const statusTooltip = statusTooltips[status];

  const tooltip = statusTooltip ? <Tooltip icon={<BsFillInfoCircleFill />} content={statusTooltip} /> : null;
  return (
    <span>
      {status === PinStatus.PINNED ? 'Complete' : status} {tooltip}
    </span>
  );
}

export default uploadStatusTableRenderer;