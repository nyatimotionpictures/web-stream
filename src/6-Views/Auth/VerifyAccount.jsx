import React, { useEffect, useState } from 'react';
import heroImage from '../../1-Assets/Hero.png';
import { styled } from '@mui/system';
import { Box, Snackbar, Stack, Alert } from '@mui/material';
import Button from '../../2-Components/Buttons/Button';
import Footer from '../../2-Components/Footer/Footer';
import logo from '../../1-Assets/logos/Logo.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import { BaseUrl } from '../../3-Middleware/apiRequest';
import axios from 'axios';

const VerifyAccount = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verifying your account...');
  const [resendStatus, setResendStatus] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.contact;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }
    axios.get(`${BaseUrl}/v1/user/verify-account?token=${token}`)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message || 'Account verified successfully!');
      })
      .catch(err => {
        setStatus('error');
        setMessage(
          err.response?.data?.message || 'Verification failed. The link may be invalid or expired.'
        );
      });
  }, [location.search]);

  // Navigate to registerSuccess after successful verification
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/registerSuccess', { replace: true });
      }, 2000); // 2 seconds delay
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const handleResend = async () => {
    setResendStatus('loading');
    try {
      await axios.post(`${BaseUrl}/v1/user/send-verification-email`, { email });
      setResendStatus('success');
      setSnackbarMessage({ message: 'Verification email resent! Please check your inbox.', severity: 'success' });
    } catch (err) {
      setResendStatus(err.response?.data?.message || 'error');
      setSnackbarMessage({ message: err.response?.data?.message || 'Failed to resend verification email.', severity: 'error' });
    }
  };

  // Determine alert severity
  let alertSeverity = 'error';
  if (message === 'Account has already been verified.') {
    alertSeverity = 'info';
  } else if (status === 'success') {
    alertSeverity = 'success';
  }

  return (
    <div className="min-h-screen !w-full flex flex-col gap-0 bg-secondary-700">
      <Container className="h-full !w-full py-20 min-h-screen flex flex-row gap-0 relative justify-center items-center">
        <div className="w-screen px-6  sm:px-0 sm:max-w-[304px] md:max-w-[350px] sm:mx-auto h-full">
          {/* logo */}
          <Box className="absolute top-2 left-2  sm:top-[34px] sm:left-10">
            <Button variant={"ghost"}>
              <img src={logo} alt={"Nyati Films"} />
            </Button>
          </Box>

          {/* card */}
          <div className="mt-8 flex flex-col gap-[22px] ">
            <Stack>
              <h1 className="text-[#F2F2F2] text-[26px] text-center select-none font-[Inter-Bold]">
                Account Verification
              </h1>
              {email && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  A verification link has been sent to <b>{email}</b>. Please check your inbox.
                </Alert>
              )}
            </Stack>
            <div className="flex flex-col gap-[10px]">
              <Alert severity={alertSeverity} sx={{ mt: 2 }}>
                {message}
              </Alert>
              {status === 'error' && email && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={handleResend}
                  disabled={resendStatus === 'loading'}
                >
                  {resendStatus === 'loading' ? 'Resending...' : 'Resend Verification Email'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
      <Footer />
      {/* snackbar */}
      <Snackbar
        open={snackbarMessage !== null}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbarMessage?.severity} variant="filled">
          {snackbarMessage?.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default VerifyAccount;

const Container = styled(Box)({
  background: `linear-gradient(
      to top,
      rgba(20, 17, 24, 1),
      rgba(20, 17, 24, 0.729)
    ),
    url(${heroImage}) left/cover no-repeat`,
}); 