import { type FC, useState } from "react";
import logo from "@/assets/logo.png";
import InputField from "@/components/shared/InputField";
import { validateEmail, validatePassword } from "@/helpers/validation";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
}

export const LoginForm: FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError("");
  };

  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
    const error = validateEmail(email);
    setEmailError(error);
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
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

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};
