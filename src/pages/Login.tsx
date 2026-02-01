import { type FC, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  clearLoginErrors,
  clearChangePasswordRequest,
} from "../redux/slices/authSlice";
import { login } from "../redux/actions/auth";
import { Alert } from "../components/shared/Alert";
import { LoginForm } from "../components/auth/LoginForm";
import { RecoveryPasswordModal } from "../components/auth/RecoveryPasswordModal";

export const Login: FC = () => {
  const dispatch = useAppDispatch();
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  const loginMessages = useAppSelector(
    (state) => state.auth.loginRequest.messages,
  );
  const loginInProgress = useAppSelector(
    (state) => state.auth.loginRequest.inProgress,
  );
  const loginOk = useAppSelector((state) => state.auth.loginRequest.ok);

  const handleCloseAlert = useCallback(() => {
    dispatch(clearLoginErrors());
  }, [dispatch]);

  const handleSubmit = useCallback(
    (email: string, password: string) => {
      dispatch(login({ email, password }));
    },
    [dispatch],
  );

  const handleOpenRecoveryModal = useCallback(() => {
    setIsRecoveryModalOpen(true);
  }, []);

  const handleCloseRecoveryModal = useCallback(() => {
    setIsRecoveryModalOpen(false);
    // Clear the state when modal closes to ensure clean state for next open
    dispatch(clearChangePasswordRequest());
  }, [dispatch]);

  const shouldShowError = loginMessages && !loginInProgress && !loginOk;

  return (
    <>
      {shouldShowError && (
        <Alert
          title="Error en el inicio de sesión"
          description={loginMessages}
          onClose={handleCloseAlert}
        />
      )}
      <LoginForm
        onSubmit={handleSubmit}
        isLoading={loginInProgress}
        onForgotPassword={handleOpenRecoveryModal}
      />
      <RecoveryPasswordModal
        key={isRecoveryModalOpen ? "open" : "closed"}
        isOpen={isRecoveryModalOpen}
        onClose={handleCloseRecoveryModal}
      />
    </>
  );
};
