import React, { useState } from 'react';
import heroImage from '../../1-Assets/Hero.png';
import { styled } from '@mui/system';
import { Box, Snackbar, Stack, Alert } from '@mui/material';
import Button from '../../2-Components/Buttons/Button';
import Footer from '../../2-Components/Footer/Footer';
import logo from '../../1-Assets/logos/Logo.svg';
import { FormContainer, SingleWrapper } from '../../2-Components/Stacks/InputFormStack';
import ErrorMessage from '../../2-Components/Forms/ErrorMessage';
import { BaseUrl } from '../../3-Middleware/apiRequest';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const ResetPassKey = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!password || !confirmPassword) return;
    if (!token) {
      setSnackbarMessage({ message: 'No reset token found in the URL.', severity: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setSnackbarMessage({ message: 'Passwords do not match.', severity: 'error' });
      return;
    }
    setLoading(true);
    setSnackbarMessage(null);
    try {
      await axios.post(`${BaseUrl}/v1/user/reset-password`, { token, newPassword: password });
      setSnackbarMessage({ message: 'Password reset successfully! Redirecting to login...', severity: 'success' });
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setSnackbarMessage({ message: err.response?.data?.message || 'Failed to reset password.', severity: 'error' });
    } finally {
      setLoading(false);
    }
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
                  Set New Password
                </h1>
                <p className="text-[#F2F2F2] text-[14px] text-center select-none font-[Inter-Regular]">
                  Enter your new password below.
                </p>
              </Stack>

              {/* inputs  */}
              <div className="flex flex-col gap-[10px]">
                <SingleWrapper>
                  <FormContainer>
                    <label className="text-[#bdb8b8] text-[12.56px]">
                      New Password
                    </label>
                    <div className="flex flex-col gap-2 h-full relative justify-center">
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="New Password"
                        value={password}
                        className="text-[#ffffff] text-[14.35px] font-[Inter-Medium]"
                        onChange={e => setPassword(e.target.value)}
                        onBlur={() => setTouched(true)}
                      />
                      <div className="w-max flex items-center justify-center px-0 py-0 absolute text-whites-40 right-3 m-auto hover:text-primary-500 z-50">
                        {!showPassword ? (
                          <span
                            onClick={() => setShowPassword((v) => !v)}
                            className="icon-[solar--eye-closed-outline] w-6 h-6"
                          ></span>
                        ) : (
                          <span
                            onClick={() => setShowPassword((v) => !v)}
                            className="icon-[solar--eye-line-duotone] w-6 h-6"
                          ></span>
                        )}
                      </div>
                    </div>
                    <ErrorMessage
                      errors={touched && !password}
                      message={!password ? 'Password is required' : ''}
                    />
                  </FormContainer>
                </SingleWrapper>
                <SingleWrapper>
                  <FormContainer>
                    <label className="text-[#bdb8b8] text-[12.56px]">
                      Confirm Password
                    </label>
                    <div className="flex flex-col gap-2 h-full relative justify-center">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        className="text-[#ffffff] text-[14.35px] font-[Inter-Medium]"
                        onChange={e => setConfirmPassword(e.target.value)}
                        onBlur={() => setTouched(true)}
                      />
                      <div className="w-max flex items-center justify-center px-0 py-0 absolute text-whites-40 right-3 m-auto hover:text-primary-500 z-50">
                        {!showConfirmPassword ? (
                          <span
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            className="icon-[solar--eye-closed-outline] w-6 h-6"
                          ></span>
                        ) : (
                          <span
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            className="icon-[solar--eye-line-duotone] w-6 h-6"
                          ></span>
                        )}
                      </div>
                    </div>
                    <ErrorMessage
                      errors={touched && !confirmPassword}
                      message={!confirmPassword ? 'Confirm password is required' : ''}
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
    </div>
  );
};

export default ResetPassKey;

const Container = styled(Box)({
  background: `linear-gradient(
      to top,
      rgba(20, 17, 24, 1),
      rgba(20, 17, 24, 0.729)
    ),
    url(${heroImage}) left/cover no-repeat`,
}); 