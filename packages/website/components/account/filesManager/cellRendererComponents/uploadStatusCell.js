import { PinStatus } from 'constants';

import { BsFillInfoCircleFill } from 'react-icons/bs';

import Tooltip from 'ZeroComponents/tooltip/tooltip';

const uploadStatusTableRenderer = ({ pins, statusMessages }) => {
  if (!pins) {
    return;
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
};

export default uploadStatusTableRenderer;
