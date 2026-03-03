import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert } from "@/components/shared/Alert";
import { Modal } from "@/components/shared/Modal";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { PasswordForm } from "@/components/profile/PasswordForm";
import { useProfile } from "@/hooks/useProfile";
import Button from "@/components/shared/Button";

export const Profile = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const {
    profileData,
    passwordData,
    profileErrors,
    passwordErrors,
    updateProfileRequest,
    changePasswordRequest,
    isPasswordFormValid,
    handleProfileChange,
    handleCompanyChange,
    handlePasswordChange,
    handleProfileSubmit,
    submitPassword,
    handleClearAllRequests,
  } = useProfile();

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    handleClearAllRequests();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Mi perfil"
          description="Gestiona tus datos personales, de facturación y tu contraseña."
        />
        <Button
          title="Cambiar contraseña"
          onClick={() => setShowPasswordModal(true)}
          variant="secondary"
        />
      </div>

      {showPasswordModal && !changePasswordRequest.ok && (
        <Modal
          title="Cambiar contraseña"
          onAccept={submitPassword}
          onClose={handleClosePasswordModal}
          acceptText={
            changePasswordRequest.inProgress
              ? "Cambiando..."
              : "Cambiar contraseña"
          }
          cancelText="Cancelar"
          acceptDisabled={
            !isPasswordFormValid || changePasswordRequest.inProgress
          }
        >
          <PasswordForm
            passwordData={passwordData}
            errors={passwordErrors}
            isLoading={changePasswordRequest.inProgress}
            onChange={handlePasswordChange}
          />
        </Modal>
      )}

      {(updateProfileRequest.ok || changePasswordRequest.ok) && (
        <Alert
          title="Acción realizada correctamente"
          onClose={handleClearAllRequests}
        />
      )}

      {((updateProfileRequest.messages && !updateProfileRequest.inProgress) ||
        (changePasswordRequest.messages &&
          !changePasswordRequest.inProgress)) && (
        <Alert
          title="Se ha producido un error al realizar la solicitud"
          onClose={handleClearAllRequests}
        />
      )}

      <div className="rounded-lg bg-white p-6 shadow">
        <ProfileForm
          profileData={profileData}
          errors={profileErrors}
          isLoading={updateProfileRequest.inProgress}
          onChange={handleProfileChange}
          onCompanyChange={handleCompanyChange}
          onSubmit={handleProfileSubmit}
        />
      </div>
    </div>
  );
};
