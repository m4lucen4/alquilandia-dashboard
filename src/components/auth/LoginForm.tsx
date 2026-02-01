import { type FC, useState } from "react";
import logo from "@/assets/logo.png";
import InputField from "@/components/shared/InputField";
import Button from "@/components/shared/Button";
import { validateEmail, validatePassword } from "@/helpers/validation";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
  onForgotPassword?: () => void;
}

export const LoginForm: FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  onForgotPassword,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const handleEmailChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handlePasswordChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError("");
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    const error = validateEmail(email);
    setEmailError(error);
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    const error = validatePassword(password);
    setPasswordError(error);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setTouched({ email: true, password: true });

    if (emailErr || passwordErr) {
      return;
    }

    onSubmit(email, password);
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Logo de Alquilandia"
          src={logo}
          className="mx-auto h-32 w-auto sm:h-40 md:h-48 lg:h-56"
        />
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Correo electrónico"
            name="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            error={touched.email ? emailError : ""}
            required
            autoComplete="email"
            placeholder="tu@email.com"
          />

          <InputField
            label="Contraseña"
            name="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            error={touched.password ? passwordError : ""}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />

          <Button
            type="submit"
            title={isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            onClick={() => {}}
            loading={isLoading}
            block
            variant="primary"
          />

          {onForgotPassword && (
            <Button
              type="button"
              title="¿Olvidaste tu contraseña?"
              onClick={onForgotPassword}
              block
              variant="ghost"
            />
          )}
        </form>
      </div>
    </div>
  );
};
