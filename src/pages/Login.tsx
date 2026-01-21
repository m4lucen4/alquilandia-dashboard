import { type FC } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { clearLoginErrors } from "../redux/slices/authSlice";
import { login } from "../redux/actions/auth";
import { Alert } from "../components/shared/Alert";
import { LoginForm } from "../components/auth/LoginForm";

export const Login: FC = () => {
  const dispatch = useAppDispatch();
  const loginRequest = useAppSelector((state) => state.auth.loginRequest);

  const handleCloseAlert = () => {
    dispatch(clearLoginErrors());
  };

  const handleSubmit = (email: string, password: string) => {
    dispatch(login({ email, password }));
  };

  const shouldShowError =
    loginRequest.messages && !loginRequest.inProgress && !loginRequest.ok;

  return (
    <>
      {shouldShowError && (
        <Alert
          title="Error en el inicio de sesión"
          description={loginRequest.messages}
          onClose={handleCloseAlert}
        />
      )}
      <LoginForm onSubmit={handleSubmit} isLoading={loginRequest.inProgress} />
    </>
  );
};
