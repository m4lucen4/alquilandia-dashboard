import type { FC } from "react";
import InputField from "@/components/shared/InputField";
import type { PasswordFormData } from "@/types/profile";

interface PasswordFormProps {
  passwordData: PasswordFormData;
  errors: Partial<Record<keyof PasswordFormData, string>>;
  isLoading: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export const PasswordForm: FC<PasswordFormProps> = ({
  passwordData,
  errors,
  isLoading,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <InputField
        label="Contraseña actual"
        name="currentPassword"
        type="password"
        value={passwordData.currentPassword}
        onChange={onChange}
        error={errors.currentPassword}
        disabled={isLoading}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Nueva contraseña"
          name="newPassword"
          type="password"
          value={passwordData.newPassword}
          onChange={onChange}
          error={errors.newPassword}
          disabled={isLoading}
          required
        />
        <InputField
          label="Confirmar nueva contraseña"
          name="confirmPassword"
          type="password"
          value={passwordData.confirmPassword}
          onChange={onChange}
          error={errors.confirmPassword}
          disabled={isLoading}
          required
        />
      </div>
    </div>
  );
};
