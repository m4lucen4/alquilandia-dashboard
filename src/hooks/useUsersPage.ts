import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchPaginatedUsersThunk,
  sendMassiveEmailThunk,
  createUserThunk,
  editUserThunk,
  generateBudgetByIdThunk,
} from "@/redux/actions/users";
import { clearUsersTable, clearUsersScreenErrors } from "@/redux/slices/usersSlice";
import { setExistingBudget, resetWizard } from "@/redux/slices/budgetWizardSlice";
import { mapFormCompany } from "@/helpers/users";
import { useUserSearch } from "@/hooks/useUserSearch";
import type { User } from "@/types/budgets";
import type { CreateUserFormValues } from "@/components/users/ModalCreateUser";
import type { EditUserFormValues } from "@/components/users/ModalEditUser";
import type { MassiveEmailFormValues } from "@/components/users/ModalMassiveEmail";

export const useUsersPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    users,
    usersTotal,
    fetchPaginatedUsersRequest,
    sendMassiveEmailRequest,
    createUserRequest,
    editUserRequest,
  } = useAppSelector((state) => state.users);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const isAdmin = currentUser?.role === "ADMIN";

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const search = useUserSearch();
  const { appliedFilters, buildFiltersQuery } = search;

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
    dispatch(clearUsersScreenErrors());
  }, [dispatch]);

  const handleCreateUser = useCallback(
    async (formData: CreateUserFormValues) => {
      const { company, password, ...rest } = formData;
      const payload: Partial<User> = {
        ...rest,
        role: isAdmin ? rest.role : "CLIENT",
        company: mapFormCompany(company),
        ...(isAdmin && password ? { password } : {}),
      };
      try {
        await dispatch(createUserThunk(payload)).unwrap();
        setIsCreateUserModalOpen(false);
        dispatch(
          fetchPaginatedUsersThunk({
            pageSize,
            pageToFetch: pageIndex + 1,
            filtersQuery: buildFiltersQuery(),
          }),
        );
      } catch {
        // error visible via createUserRequest.messages
      }
    },
    [dispatch, buildFiltersQuery, pageSize, pageIndex, isAdmin],
  );

  const handleOpenEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  }, []);

  const handleCloseEditUser = useCallback(() => {
    setIsEditUserModalOpen(false);
    setSelectedUser(null);
  }, []);

  const handleGenerateBudget = useCallback(
    async (user: User) => {
      dispatch(resetWizard());
      const result = await dispatch(generateBudgetByIdThunk(user.id));
      if (generateBudgetByIdThunk.fulfilled.match(result)) {
        dispatch(setExistingBudget(result.payload));
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
        handleCloseEditUser();
        dispatch(
          fetchPaginatedUsersThunk({
            pageSize,
            pageToFetch: pageIndex + 1,
            filtersQuery: buildFiltersQuery(),
          }),
        );
      } catch {
        // error visible via editUserRequest.messages
      }
    },
    [dispatch, selectedUser, buildFiltersQuery, pageSize, pageIndex, handleCloseEditUser],
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

  const recipientEmails = Array.from(selectedIds)
    .map((id) => users.find((u) => u.id === id)?.email)
    .filter((email): email is string => !!email);

  const handleSendEmail = useCallback(
    async (formData: MassiveEmailFormValues) => {
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
    [dispatch, recipientEmails],
  );

  return {
    ...search,
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
  };
};
