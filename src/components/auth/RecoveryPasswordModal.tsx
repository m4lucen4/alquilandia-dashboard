import { type FC, useState } from "react";
import { Modal } from "../shared/Modal";
import InputField from "../shared/InputField";
import { validateEmail } from "@/helpers/validation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { changePassword } from "@/redux/actions/auth";

interface RecoveryPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecoveryPasswordModal: FC<RecoveryPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [touched, setTouched] = useState(false);

  const changePasswordInProgress = useAppSelector(
    (state) => state.auth.changePasswordRequest.inProgress,
  );
  const changePasswordOk = useAppSelector(
    (state) => state.auth.changePasswordRequest.ok,
  );
  const changePasswordMessages = useAppSelector(
    (state) => state.auth.changePasswordRequest.messages,
  );

  const handleEmailChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handleEmailBlur = () => {
    setTouched(true);
    const error = validateEmail(email);
    setEmailError(error);
  };

  const handleAccept = async () => {
    const error = validateEmail(email);
    setEmailError(error);
    setTouched(true);

    if (error) {
      return;
    }

    try {
      await dispatch(changePassword(email)).unwrap();
      // Success: close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch {
      // Error is already handled by Redux state
    }
  };

  const isAcceptDisabled =
    !email || !!emailError || changePasswordInProgress || changePasswordOk;

  if (!isOpen) return null;

  return (
    <Modal
      title="Recuperar contraseña"
      onAccept={handleAccept}
      onClose={onClose}
      acceptText={
        changePasswordOk
          ? "Enviado ✓"
          : changePasswordInProgress
            ? "Enviando..."
            : "Enviar"
      }
      cancelText="Cancelar"
      acceptDisabled={isAcceptDisabled}
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Introduce tu correo electrónico y te enviaremos las instrucciones para
          restablecer tu contraseña.
        </p>

        <InputField
          label="Correo electrónico"
          name="recovery-email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          error={touched ? emailError : ""}
          required
          autoComplete="email"
          placeholder="tu@email.com"
          disabled={changePasswordInProgress || changePasswordOk}
        />

        {changePasswordOk && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
            ✓ Se ha enviado un correo con las instrucciones para restablecer tu
            contraseña.
          </div>
        )}

        {changePasswordMessages &&
          !changePasswordInProgress &&
          !changePasswordOk && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {changePasswordMessages}
            </div>
          )}
      </div>
    </Modal>
  );
};
