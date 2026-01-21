import type { FC } from "react";

interface CardProps {
  title: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

export const Card: FC<CardProps> = ({ title, color, icon: Icon, onClick }) => {
  // Estilos del contenedor de la tarjeta
  const cardStyles = `group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer`;

  // Estilos de la barra de color superior
  const colorBarStyles = `absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 group-hover:h-2`;

  // Estilos del contenedor de contenido
  const contentStyles = "p-6 flex items-center gap-4";

  // Estilos del contenedor del icono
  const iconContainerStyles = `flex-shrink-0 rounded-xl p-3 transition-all duration-300 group-hover:scale-110`;

  // Estilos del icono
  const iconStyles = "h-8 w-8 text-white";

  // Estilos del título
  const titleStyles =
    "flex-1 text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-gray-700";

  return (
    <div
      className={cardStyles}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Navegar a ${title}`}
    >
      {/* Barra de color superior */}
      <div className={colorBarStyles} style={{ backgroundColor: color }} />

      {/* Contenido */}
      <div className={contentStyles}>
        {/* Icono */}
        <div className={iconContainerStyles} style={{ backgroundColor: color }}>
          <Icon className={iconStyles} />
        </div>

        {/* Título */}
        <h3 className={titleStyles}>{title}</h3>

        {/* Indicador de navegación */}
        <svg
          className="h-5 w-5 shrink-0 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
};
