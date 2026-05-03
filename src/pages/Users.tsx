import { type FC, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchPaginatedUsersThunk, sendMassiveEmailThunk, createUserThunk, editUserThunk, generateBudgetByIdThunk } from "../redux/actions/users";
import { clearUsersTable } from "../redux/slices/usersSlice";
import { setExistingBudget, resetWizard } from "../redux/slices/budgetWizardSlice";
import { Alert } from "../components/shared/Alert";
import { PageHeader } from "@/components/shared/PageHeader";
import { UsersTable } from "../components/users/UsersTable";
import { SearchUsers } from "../components/users/SearchUsers";
import { ModalMassiveEmail, type MassiveEmailFormValues } from "../components/users/ModalMassiveEmail";
import { ModalCreateUser, type CreateUserFormValues } from "../components/users/ModalCreateUser";
import { ModalEditUser, type EditUserFormValues } from "../components/users/ModalEditUser";
import Button from "@/components/shared/Button";
import { EnvelopeIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import type { User, Company } from "../types/budgets";
import { useUserSearch } from "../hooks/useUserSearch";

const mapFormCompany = (
  company: Partial<Company> | undefined,
): Company | null => {
  if (!company || !Object.values(company).some(Boolean)) return null;
  return {
    name: company.name ?? "",
    nif: company.nif ?? "",
    address: company.address ?? "",
    population: company.population ?? "",
    locality: company.locality ?? "",
    zipCode: company.zipCode ?? "",
  };
};

export const Users: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { users, usersTotal, fetchPaginatedUsersRequest, sendMassiveEmailRequest, createUserRequest, editUserRequest } =
    useAppSelector((state) => state.users);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
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
    appliedFilters,
    handleSearch,
    handleClearFilters,
    buildFiltersQuery,
  } = useUserSearch();

  useEffect(() => {
    const filtersQuery = buildFiltersQuery();
    dispatch(
      fetchPaginatedUsersThunk({
        pageSize,
        pageToFetch: pageIndex + 1,
        filtersQuery,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, pageIndex, pageSize, appliedFilters]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [pageIndex]);

  useEffect(() => {
    return () => {
      dispatch(clearUsersTable());
    };
  }, [dispatch]);

  const handleCloseAlert = useCallback(() => {
    dispatch(clearUsersTable());
  }, [dispatch]);

  const handleCreateUser = useCallback(
    async (formData: CreateUserFormValues) => {
      const { company, ...rest } = formData;
      const payload: Partial<User> = { ...rest, company: mapFormCompany(company) };
      try {
        await dispatch(createUserThunk(payload)).unwrap();
        setIsCreateUserModalOpen(false);
        const filtersQuery = buildFiltersQuery();
        dispatch(fetchPaginatedUsersThunk({ pageSize, pageToFetch: pageIndex + 1, filtersQuery }));
      } catch {
        // error visible via createUserRequest.messages
      }
    },
    [dispatch, buildFiltersQuery, pageSize, pageIndex],
  );

  const handleOpenEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  }, []);

  const handleGenerateBudget = useCallback(
    async (user: User) => {
      dispatch(resetWizard());
      const result = await dispatch(generateBudgetByIdThunk(user.id));
      if (generateBudgetByIdThunk.fulfilled.match(result)) {
        dispatch(setExistingBudget(result.payload.id));
        navigate("/budgets/new");
      }
    },
    [dispatch, navigate],
  );

  const handleEditUser = useCallback(
    async (formData: EditUserFormValues) => {
      if (!selectedUser) return;
      const { company, ...rest } = formData;
      const body: Partial<User> = { ...rest, company: mapFormCompany(company) };
      try {
        await dispatch(editUserThunk({ id: selectedUser.id, body })).unwrap();
        setIsEditUserModalOpen(false);
        setSelectedUser(null);
        const filtersQuery = buildFiltersQuery();
        dispatch(fetchPaginatedUsersThunk({ pageSize, pageToFetch: pageIndex + 1, filtersQuery }));
      } catch {
        // error visible via editUserRequest.messages
      }
    },
    [dispatch, selectedUser, buildFiltersQuery, pageSize, pageIndex],
  );

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  }, []);

  const handleSelectionChange = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSendEmail = useCallback(
    async (formData: MassiveEmailFormValues) => {
      const recipientEmails = Array.from(selectedIds)
        .map((id) => users.find((u) => u.id === id)?.email)
        .filter((email): email is string => !!email);

      try {
        await dispatch(
          sendMassiveEmailThunk({
            subject: formData.subject,
            ...(formData.buttonText && { buttonText: formData.buttonText }),
            ...(formData.buttonUrl && { buttonUrl: formData.buttonUrl }),
            ...(formData.image && { image: formData.image }),
            emails: recipientEmails,
          }),
        ).unwrap();
        setIsEmailModalOpen(false);
        setSelectedIds(new Set());
      } catch {
        // error visible via sendMassiveEmailRequest.messages
      }
    },
    [dispatch, selectedIds, users],
  );

  const recipientEmails = Array.from(selectedIds)
    .map((id) => users.find((u) => u.id === id)?.email)
    .filter((email): email is string => !!email);

  const shouldShowFetchError =
    fetchPaginatedUsersRequest.messages &&
    !fetchPaginatedUsersRequest.inProgress &&
    !fetchPaginatedUsersRequest.ok;

  const shouldShowEmailError =
    sendMassiveEmailRequest.messages &&
    !sendMassiveEmailRequest.inProgress &&
    !sendMassiveEmailRequest.ok;

  const shouldShowCreateUserError =
    createUserRequest.messages &&
    !createUserRequest.inProgress &&
    !createUserRequest.ok;

  const shouldShowEditUserError =
    editUserRequest.messages &&
    !editUserRequest.inProgress &&
    !editUserRequest.ok;

  return (
    <>
      {shouldShowFetchError && (
        <Alert
          title="Error al cargar usuarios"
          description={fetchPaginatedUsersRequest.messages}
          onClose={handleCloseAlert}
        />
      )}

      {shouldShowEmailError && (
        <Alert
          title="Error al enviar el email"
          description={sendMassiveEmailRequest.messages}
          onClose={handleCloseAlert}
        />
      )}

      {shouldShowCreateUserError && (
        <Alert
          title="Error al crear el usuario"
          description={createUserRequest.messages}
          onClose={handleCloseAlert}
        />
      )}

      {shouldShowEditUserError && (
        <Alert
          title="Error al editar el usuario"
          description={editUserRequest.messages}
          onClose={handleCloseAlert}
        />
      )}

      <ModalCreateUser
        isOpen={isCreateUserModalOpen}
        isCreating={createUserRequest.inProgress}
        onClose={() => setIsCreateUserModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      <ModalEditUser
        key={selectedUser?.id}
        isOpen={isEditUserModalOpen}
        isEditing={editUserRequest.inProgress}
        user={selectedUser}
        onClose={() => { setIsEditUserModalOpen(false); setSelectedUser(null); }}
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

        <UsersTable
          users={users}
          total={usersTotal}
          pageIndex={pageIndex}
          pageSize={pageSize}
          isLoading={fetchPaginatedUsersRequest.inProgress}
          selectedIds={selectedIds}
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
