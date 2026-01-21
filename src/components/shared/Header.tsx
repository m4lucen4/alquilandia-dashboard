import { type FC, useState } from "react";
import { Link } from "react-router-dom";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/actions/auth";
import { type CurrentUser } from "@/types/auth";
import { Modal } from "./Modal";

// Types
interface HeaderProps {
  user: CurrentUser | null;
}

interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}

interface UserNavigationItem {
  name: string;
  href: string;
  action: string | null;
}

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md";
}

// Constants
const navigation: NavigationItem[] = [
  { name: "Inicio", href: "/", current: true },
  { name: "Usuarios", href: "#", current: false },
  { name: "Presupuestos", href: "/budgets", current: false },
  { name: "Inventario", href: "#", current: false },
  { name: "Contabilidad", href: "/accounting", current: false },
];

const userNavigation: UserNavigationItem[] = [
  { name: "Perfil", href: "#", action: null },
  { name: "Ajustes plataforma", href: "/settings", action: null },
  { name: "Cerrar sesión", href: "#", action: "logout" },
];

// Utilities
function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

function getInitials(firstName: string, lastName: string): string {
  const firstInitial = firstName?.charAt(0)?.toUpperCase() || "";
  const lastInitial = lastName?.charAt(0)?.toUpperCase() || "";
  return `${firstInitial}${lastInitial}`;
}

// Components
const UserAvatar: FC<UserAvatarProps> = ({
  firstName,
  lastName,
  size = "md",
}) => {
  const initials = getInitials(firstName, lastName);
  const sizeClasses = {
    sm: "size-8 text-sm",
    md: "size-10 text-base",
  };

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-white font-semibold text-blue-600`}
    >
      {initials}
    </div>
  );
};

export const Header: FC<HeaderProps> = ({ user }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dispatch = useAppDispatch();

  const handleLogoutClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const handleLogout = (): void => {
    dispatch(logout());
  };

  if (!user) {
    return null;
  }

  // Filter user navigation based on role
  const getFilteredUserNavigation = (): UserNavigationItem[] => {
    return userNavigation.filter((item) => {
      // Only show "Ajustes plataforma" to ADMIN users
      if (item.name === "Ajustes plataforma") {
        return user.role === "ADMIN";
      }
      return true;
    });
  };

  const filteredUserNavigation = getFilteredUserNavigation();

  return (
    <>
      {showLogoutModal && (
        <Modal
          title="Cerrar sesión"
          onAccept={handleLogout}
          onClose={() => setShowLogoutModal(false)}
          acceptText="Cerrar sesión"
          cancelText="Cancelar"
        >
          <p>¿Estás seguro de que quieres cerrar sesión?</p>
        </Modal>
      )}
      <Disclosure as="nav" className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      aria-current={item.current ? "page" : undefined}
                      className={classNames(
                        item.current
                          ? "bg-gray-950/50 text-white"
                          : "text-gray-300 hover:bg-white/5 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium",
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <MenuButton className="relative flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        firstName={user.firstName}
                        lastName={user.lastName}
                        size="sm"
                      />
                      <div className="hidden lg:block text-left">
                        <div className="text-sm font-medium text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-300">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </MenuButton>

                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                  >
                    {filteredUserNavigation.map((item) => (
                      <MenuItem key={item.name}>
                        {item.action === "logout" ? (
                          <a
                            href={item.href}
                            onClick={handleLogoutClick}
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:outline-hidden"
                          >
                            {item.name}
                          </a>
                        ) : (
                          <Link
                            to={item.href}
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:outline-hidden"
                          >
                            {item.name}
                          </Link>
                        )}
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              {/* Mobile menu button */}
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon
                  aria-hidden="true"
                  className="block size-6 group-data-open:hidden"
                />
                <XMarkIcon
                  aria-hidden="true"
                  className="hidden size-6 group-data-open:block"
                />
              </DisclosureButton>
            </div>
          </div>
        </div>

        <DisclosurePanel className="md:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
            {navigation.map((item) => (
              <DisclosureButton
                key={item.name}
                as={Link}
                to={item.href}
                aria-current={item.current ? "page" : undefined}
                className={classNames(
                  item.current
                    ? "bg-gray-950/50 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white",
                  "block rounded-md px-3 py-2 text-base font-medium",
                )}
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 pb-3">
            <div className="flex items-center px-5">
              <div className="shrink-0">
                <UserAvatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  size="md"
                />
              </div>
              <div className="ml-3">
                <div className="text-base/5 font-medium text-white">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm font-medium text-gray-400">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              {filteredUserNavigation.map((item) =>
                item.action === "logout" ? (
                  <DisclosureButton
                    key={item.name}
                    as="a"
                    href={item.href}
                    onClick={handleLogoutClick}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white"
                  >
                    {item.name}
                  </DisclosureButton>
                ) : (
                  <DisclosureButton
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white"
                  >
                    {item.name}
                  </DisclosureButton>
                ),
              )}
            </div>
          </div>
        </DisclosurePanel>
      </Disclosure>
    </>
  );
};
