import { type FC } from "react";
import { Alert } from "../components/shared/Alert";
import { PageHeader } from "@/components/shared/PageHeader";
import { UsersTable } from "../components/users/UsersTable";
import { SearchUsers } from "../components/users/SearchUsers";
import { ModalMassiveEmail } from "../components/users/ModalMassiveEmail";
import { ModalCreateUser } from "../components/users/ModalCreateUser";
import { ModalEditUser } from "../components/users/ModalEditUser";
import Button from "@/components/shared/Button";
import { EnvelopeIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { useUsersPage } from "../hooks/useUsersPage";
import { getUsersScreenError } from "../helpers/users";

export const Users: FC = () => {
  const {
    isAdmin,
    users,
    usersTotal,
    fetchPaginatedUsersRequest,
    sendMassiveEmailRequest,
    createUserRequest,
    editUserRequest,
    pageIndex,
    setPageIndex,
    pageSize,
    selectedIds,
    recipientEmails,
    isEmailModalOpen,
    setIsEmailModalOpen,
    isCreateUserModalOpen,
    setIsCreateUserModalOpen,
    isEditUserModalOpen,
    selectedUser,
    handleCloseEditUser,
    handleCloseAlert,
    handleCreateUser,
    handleOpenEditUser,
    handleGenerateBudget,
    handleEditUser,
    handlePageSizeChange,
    handleSelectionChange,
    handleSendEmail,
    email,
    setEmail,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    dnif,
    setDnif,
    phone,
    setPhone,
    role,
    setRole,
    appliedFilters,
    handleSearch,
    handleClearFilters,
  } = useUsersPage();

  const screenError = getUsersScreenError({
    fetchPaginatedUsersRequest,
    sendMassiveEmailRequest,
    createUserRequest,
    editUserRequest,
  });

  return (
    <>
      {screenError && (
        <Alert
          title={screenError.title}
          description={screenError.description}
          onClose={handleCloseAlert}
        />
      )}

      <ModalCreateUser
        isOpen={isCreateUserModalOpen}
        isCreating={createUserRequest.inProgress}
        isAdmin={isAdmin}
        onClose={() => setIsCreateUserModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      <ModalEditUser
        key={selectedUser?.id}
        isOpen={isEditUserModalOpen}
        isEditing={editUserRequest.inProgress}
        user={selectedUser}
        onClose={handleCloseEditUser}
        onSubmit={handleEditUser}
      />

      <ModalMassiveEmail
        isOpen={isEmailModalOpen}
        recipientEmails={recipientEmails}
        isSending={sendMassiveEmailRequest.inProgress}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handleSendEmail}
      />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Usuarios"
          description="Listado de usuarios registrados"
        />

        <SearchUsers
          email={email}
          setEmail={setEmail}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          dnif={dnif}
          setDnif={setDnif}
          phone={phone}
          setPhone={setPhone}
          role={role}
          setRole={setRole}
          appliedFilters={appliedFilters}
          isLoading={fetchPaginatedUsersRequest.inProgress}
          onSearch={() => {
            handleSearch();
            setPageIndex(0);
          }}
          onClearFilters={() => {
            handleClearFilters();
            setPageIndex(0);
          }}
        />

        {isAdmin && (
          <div className="mt-6 mb-4 flex gap-3">
            <Button
              title="Nuevo usuario"
              onClick={() => setIsCreateUserModalOpen(true)}
              variant="secondary"
              icon={<UserPlusIcon className="h-4 w-4" />}
            />
            <Button
              title={selectedIds.size > 0 ? `Enviar email (${selectedIds.size})` : "Enviar email"}
              onClick={() => setIsEmailModalOpen(true)}
              variant="primary"
              icon={<EnvelopeIcon className="h-4 w-4" />}
              disabled={selectedIds.size === 0}
            />
          </div>
        )}

        <UsersTable
          users={users}
          total={usersTotal}
          pageIndex={pageIndex}
          pageSize={pageSize}
          isLoading={fetchPaginatedUsersRequest.inProgress}
          selectedIds={selectedIds}
          isAdmin={isAdmin}
          onPageChange={setPageIndex}
          onPageSizeChange={handlePageSizeChange}
          onSelectionChange={handleSelectionChange}
          onEditUser={handleOpenEditUser}
          onGenerateBudget={handleGenerateBudget}
        />
      </div>
    </>
  );
};
