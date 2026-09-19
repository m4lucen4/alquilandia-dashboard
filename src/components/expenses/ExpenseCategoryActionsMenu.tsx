import { type FC } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import Button from "@/components/shared/Button";
import type { ExpenseCategory } from "@/types/expensesCategories";

interface ExpenseCategoryActionsMenuProps {
  category: ExpenseCategory;
  onEdit: (category: ExpenseCategory) => void;
  onDelete: (category: ExpenseCategory) => void;
}

export const ExpenseCategoryActionsMenu: FC<ExpenseCategoryActionsMenuProps> = ({
  category,
  onEdit,
  onDelete,
}) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="flex items-center rounded-full p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        <span className="sr-only">Abrir menú</span>
        <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
      </MenuButton>

      <MenuItems
        transition
        anchor={{ to: "bottom end", gap: 8 }}
        className="z-50 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          <MenuItem>
            {({ focus }) => (
              <div className="px-2">
                <Button
                  title="Editar"
                  onClick={() => onEdit(category)}
                  variant="ghost"
                  size="sm"
                  block
                  className={focus ? "bg-gray-100" : ""}
                />
              </div>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <div className="px-2">
                <Button
                  title="Eliminar"
                  onClick={() => onDelete(category)}
                  variant="ghost"
                  size="sm"
                  block
                  className={focus ? "bg-red-50 text-red-600" : "text-red-600"}
                />
              </div>
            )}
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
};
