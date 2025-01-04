import React from 'react'
import PaymentSuccessful from './PaymentSuccessful';
import PaymentPending from './PaymentPending';
import PaymentFailed from './PaymentFailed';
import PaymentTimedout from './PaymentTimedout';
import { useParams } from 'react-router-dom';
import PropTypes from "prop-types";
import { getPaymentStatus } from '../../../5-Store/TanstackStore/services/api';

const PaymentValidation = () => {
    const params = useParams();
    const [errorMessage, setErrorMessage] = useState("");
  
    const { data, status, error, refetch } = useQuery({
      queryKey: ["paymentStatus", params?.orderTrackingId],
      queryFn: () => getPaymentStatus(params?.orderTrackingId),
      enabled: !!params.orderTrackingId,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
   
    });


  React.useEffect(() => {
  
    let timedout = null;
    if (status === "success") {
      if (data?.status === "PENDING") {
        timedout = setTimeout(() => {
          refetch();
        }, 20000);
      } else {
        clearTimeout(timedout);
      }
    }
    

    return () => {
      console.log("unmount");
     
    };
  }, [data, params?.orderTrackingId, status]);
  return (
    <div className="bg-secondary-800 text-whites-50 min-h-[100vh] w-full flex flex-col items-center justify-center gap-[20px] relative">
    {
      <DisplayContainer
        status={data?.status ?? "PENDING"}
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

export default PaymentValidation