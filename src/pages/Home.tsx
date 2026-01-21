import { type FC } from "react";
import { useAppSelector } from "@/redux/hooks";

export const Home: FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        {currentUser && (
          <p className="mt-2 text-sm text-gray-600">
            ¡Hola, {currentUser.firstName}! Bienvenido de nuevo al panel de
            control.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Futuros widgets o estadísticas */}
      </div>
    </div>
  );
};
