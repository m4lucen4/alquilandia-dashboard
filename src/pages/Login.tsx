import { type FC, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { clearLoginErrors } from "../redux/slices/authSlice";
import { login } from "../redux/actions/auth";
import { Alert } from "../components/shared/Alert";
import { LoginForm } from "../components/auth/LoginForm";

export const Login: FC = () => {
  const dispatch = useAppDispatch();
  // Use specific selectors to avoid unnecessary re-renders
  const loginMessages = useAppSelector((state) => state.auth.loginRequest.messages);
  const loginInProgress = useAppSelector((state) => state.auth.loginRequest.inProgress);
  const loginOk = useAppSelector((state) => state.auth.loginRequest.ok);

  const handleCloseAlert = useCallback(() => {
    dispatch(clearLoginErrors());
  }, [dispatch]);

  const handleSubmit = useCallback((email: string, password: string) => {
    dispatch(login({ email, password }));
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
      <LoginForm onSubmit={handleSubmit} isLoading={loginInProgress} />
    </>
  );
};
