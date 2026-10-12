import React, { useCallback } from 'react'
import PaymentSuccessful from './PaymentSuccessful';
import PaymentPending from './PaymentPending';
import PaymentFailed from './PaymentFailed';
import PaymentTimedout from './PaymentTimedout';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PropTypes from "prop-types";
import { getPaymentStatus, makeFilmPurchase } from '../../../5-Store/TanstackStore/services/api';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

/** film purchase status: SUCCESSFUL, FAILED, TIMEOUT or PENDING */
const statusOf = (data) => data?.status?.toLowerCase();

const PaymentValidation = () => {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    // checking restarts its 3 minute window for every new attempt
    const startedAt = React.useRef(Date.now());
    React.useEffect(() => {
      startedAt.current = Date.now();
    }, [params?.orderTrackingId]);

    const { data } = useQuery({
      queryKey: ["paymentStatus", params?.orderTrackingId],
      queryFn: () => getPaymentStatus(params?.orderTrackingId),
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

    // what the payment form handed over; missing after a page refresh
    const { payment, paymentPageState } = location.state ?? {};

    /** Back to the payment form for the same title, to enter another number. */
    const changeNumber = useCallback(() => {
      if (paymentPageState) {
        navigate("/payment", { replace: true, state: paymentPageState });
      } else {
        navigate(-1);
      }
    }, [navigate, paymentPageState]);

    // "Try again": send the same purchase to the same number as a new attempt
    const retryMutation = useMutation({
      mutationFn: makeFilmPurchase,
      onSuccess: (result) => {
        setErrorMessage("");
        navigate(`/payment/validate/${result?.orderTrackingId}`, {
          replace: true,
          state: { ...location.state, orderTrackingId: result?.orderTrackingId },
        });
      },
      onError: (error) => {
        setErrorMessage(error?.message ?? "Could not resend the payment. Please try again.");
      },
    });

    const retry = useCallback(() => {
      // without the original details (e.g. after a refresh) there is nothing to resend
      if (!payment) return changeNumber();
      retryMutation.mutate(payment);
    }, [payment, changeNumber, retryMutation]);

  return (
    <div className="bg-secondary-800 text-whites-50 min-h-[100vh] w-full flex flex-col items-center justify-center gap-[20px] relative">
    {
      <DisplayContainer
        status={statusOf(data) ?? "pending"}
        errorMessage={errorMessage}
        onRetry={retry}
        onChangeNumber={changeNumber}
        retrying={retryMutation.isPending}
      />
    }
  </div>
  )
}

const DisplayContainer = React.memo(({ status, errorMessage, onRetry, onChangeNumber, retrying }) => {
    const renderSwitch = useCallback(
      (status) => {
        let statusLower =
          (status && status !== null) || (status && status !== undefined)
            ? status.toLowerCase()
            : "";
        const actions = { onRetry, onChangeNumber, retrying, errorMessage };
        switch (statusLower) {
          case "successful":
            return <PaymentSuccessful />;
          case "pending" || null || undefined:
            return <PaymentPending errorMessage={errorMessage} />;
          case "failed":
            return <PaymentFailed {...actions} />;
          case "timeout":
          case "timedout":
            return <PaymentTimedout {...actions} />;
          default:
            return <PaymentPending errorMessage={errorMessage} />;
        }
      },
      [errorMessage, onRetry, onChangeNumber, retrying]
    );

    return <div>{renderSwitch(status)}</div>;
  });


DisplayContainer.displayName = "DisplayContainer";

DisplayContainer.propTypes = {
  status: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
  onRetry: PropTypes.func,
  onChangeNumber: PropTypes.func,
  retrying: PropTypes.bool,
};

export default PaymentValidation
