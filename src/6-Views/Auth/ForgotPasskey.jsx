import React, { useState } from 'react';
import heroImage from '../../1-Assets/Hero.png';
import { styled } from '@mui/system';
import { Box, Snackbar, Stack, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Button from '../../2-Components/Buttons/Button';
import Footer from '../../2-Components/Footer/Footer';
import logo from '../../1-Assets/logos/Logo.svg';
import { FormContainer, SingleWrapper } from '../../2-Components/Stacks/InputFormStack';
import ErrorMessage from '../../2-Components/Forms/ErrorMessage';
import { BaseUrl } from '../../3-Middleware/apiRequest';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPasskey = () => {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!email) return;
    setLoading(true);
    setSnackbarMessage(null);
    try {
      await axios.post(`${BaseUrl}/v1/user/send-password-reset-email`, { email });
      setDialogOpen(true);
    } catch (err) {
      setSnackbarMessage({ message: err.response?.data?.message || 'Failed to send password reset email.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Optionally redirect to login:
    // navigate('/login');
  };

  return (
    <div className="min-h-screen !w-full flex flex-col gap-0 bg-secondary-700">
      <Container className="h-full !w-full py-20 min-h-screen flex flex-row gap-0 relative justify-center items-center">
        <form onSubmit={handleSubmit}>
          <div className="w-screen px-6  sm:px-0 sm:max-w-[304px] md:max-w-[350px] sm:mx-auto h-full">
            {/* logo */}
            <Box className="absolute top-2 left-2  sm:top-[34px] sm:left-10">
              <Button variant={"ghost"}>
                <img src={logo} alt={"Nyati Films"} />
              </Button>
            </Box>

            {/* form */}
            <div className="mt-8 flex flex-col gap-[22px] ">
              {/* title */}
              <Stack>
                <h1 className="text-[#F2F2F2] text-[26px] text-center select-none font-[Inter-Bold]">
                  Reset Password
                </h1>
                <p className="text-[#F2F2F2] text-[14px] text-center select-none font-[Inter-Regular]">
                  Enter your email below or{' '}
                  <span
                    onClick={() => navigate('/login')}
                    className="text-[#ED3F62] underline underline-offset-2 cursor-pointer font-[Inter-SemiBold]"
                  >
                    back to login
                  </span>
                </p>
                <p className="text-[#F2F2F2] text-[14px] text-center">
                  You will receive a password reset link to your email
                </p>
              </Stack>

              {/* inputs  */}
              <div className="flex flex-col gap-[10px]">
                <SingleWrapper>
                  <FormContainer>
                    <label className="text-[#bdb8b8] text-[12.56px]">
                      Email
                    </label>
                    <input
                      name="email"
                      placeholder="Email"
                      value={email}
                      className="text-[#ffffff] text-[14.35px] font-[Inter-Medium]"
                      onChange={e => setEmail(e.target.value)}
                      onBlur={() => setTouched(true)}
                    />
                    <ErrorMessage
                      errors={touched && !email}
                      message={!email ? 'Email is required' : ''}
                    />
                  </FormContainer>
                </SingleWrapper>
                {/* Button */}
                <div className="flex mt-4">
                  <Button
                    type="submit"
                    className="w-full min-w-[150px] px-4 rounded-full"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Reset Password'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
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
      {/* Success Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Password Reset Link Sent</DialogTitle>
        <DialogContent>
          <p style={{ marginBottom: 8 }}>
            A password reset link has been sent to <b>{email}</b>.
          </p>
          <ol style={{ paddingLeft: 18, marginBottom: 0 }}>
            <li>Check your inbox for an email from Nyati Motion Pictures.</li>
            <li>Click the link in the email to reset your password.</li>
            <li>If you don't see the email, check your spam or junk folder.</li>
          </ol>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ForgotPasskey;

const Container = styled(Box)({
  background: `linear-gradient(
      to top,
      rgba(20, 17, 24, 1),
      rgba(20, 17, 24, 0.729)
    ),
    url(${heroImage}) left/cover no-repeat`,
}); 