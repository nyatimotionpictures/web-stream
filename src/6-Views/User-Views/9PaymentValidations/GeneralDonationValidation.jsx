import React from 'react'
import PaymentSuccessful from './PaymentSuccessful';
import PaymentPending from './PaymentPending';
import PaymentFailed from './PaymentFailed';
import PaymentTimedout from './PaymentTimedout';
import { useParams } from 'react-router-dom';
import PropTypes from "prop-types";
import { getGeneralDonationStatus } from '../../../5-Store/TanstackStore/services/api';

/**
 * Website donation status. The endpoint answers with payStatus as a message
 * ("Transaction Successful", ...), not a status field.
 */
const PAY_STATUSES = {
  "transaction successful": "successful",
  "transaction has failed": "failed",
  "transaction rejected": "failed",
  "transaction timedout": "timeout",
  "transaction pending": "pending",
  pending: "pending",
};
const statusOf = (data) =>
  data?.status?.toLowerCase() ?? PAY_STATUSES[data?.payStatus?.toLowerCase()];

const GeneralDonationValidation = () => {
    const params = useParams();
        const [errorMessage, setErrorMessage] = useState("");
      
        const startedAt = React.useRef(Date.now());
        const { data } = useQuery({
          queryKey: ["generalDonationStatus", params?.orderTrackingId],
          queryFn: () => getGeneralDonationStatus(params?.orderTrackingId),
          enabled: !!params.orderTrackingId,
          refetchOnMount: false,
      // check every 3s while pending (MoMo approvals take seconds), including
      // after a failed check; stop after 3 minutes, when MTN has timed out
      refetchOnWindowFocus: true,
      retry: false,
      refetchInterval: (query) => {
        const current = statusOf(query.state.data);
        const pending = !current || current === "pending";
        return pending && Date.now() - startedAt.current < 3 * 60 * 1000 ? 3000 : false;
      },
      refetchIntervalInBackground: false,
        });
    
    
  return (
    <div className="bg-secondary-800 text-whites-50 min-h-[100vh] w-full flex flex-col items-center justify-center gap-[20px] relative">
    {
      <DisplayContainer
        status={statusOf(data) ?? "pending"}
        errorMessage={errorMessage}
      />
    }
  </div>
  )
}

const DisplayContainer = React.memo(({ status, errorMessage }) => {
    const renderSwitch = useCallback(
      (status) => {
        let statusLower =
          (status && status !== null) || (status && status !== undefined)
            ? status.toLowerCase()
            : "";
        switch (statusLower) {
          case "successful":
            return <PaymentSuccessful />;
          case "pending" || null || undefined:
            return <PaymentPending errorMessage={errorMessage} />;
          case "failed":
            return <PaymentFailed />;
          case "timeout":
          case "timedout":
            return <PaymentTimedout />;
          default:
            return <PaymentPending errorMessage={errorMessage} />;
        }
      },
      [errorMessage]
    );
  
    return <div>{renderSwitch(status)}</div>;
  });
  

DisplayContainer.displayName = "DisplayContainer";

DisplayContainer.propTypes = {
  status: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
};

export default GeneralDonationValidation