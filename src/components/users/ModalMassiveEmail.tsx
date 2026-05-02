import { type FC, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "@/components/shared/InputField";
import Button from "@/components/shared/Button";

const massiveEmailSchema = z.object({
  subject: z.string().min(1, "El cuerpo del mensaje es obligatorio"),
  buttonText: z.string().optional(),
  buttonUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      "URL inválida (debe empezar con http:// o https://)",
    ),
  image: z.instanceof(File).optional(),
});

export type MassiveEmailFormValues = z.infer<typeof massiveEmailSchema>;

interface ModalMassiveEmailProps {
  isOpen: boolean;
  recipientEmails: string[];
  isSending: boolean;
  onClose: () => void;
  onSubmit: (data: MassiveEmailFormValues) => void;
}

export const ModalMassiveEmail: FC<ModalMassiveEmailProps> = ({
  isOpen,
  recipientEmails,
  isSending,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MassiveEmailFormValues>({
    resolver: zodResolver(massiveEmailSchema),
    defaultValues: {
      subject: "",
      buttonText: "",
      buttonUrl: "",
    },
  });

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-labelledby="modal-email-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Cerrar modal"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="p-6 sm:p-8">
            <h3
              id="modal-email-title"
              className="mb-6 text-xl font-semibold text-gray-900"
            >
              Envío de email masivo
            </h3>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              {/* Para — display only */}
              <div>
                <label className="block text-sm/6 font-medium text-gray-900">
                  Para
                </label>
                <div className="mt-2 min-h-9 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600 outline-1 -outline-offset-1 outline-gray-300">
                  {recipientEmails.length > 0
                    ? recipientEmails.join(", ")
                    : "—"}
                </div>
              </div>

              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="Cuerpo del mensaje"
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    required
                    as="textarea"
                    rows={5}
                    placeholder="Escribe el contenido del email..."
                    error={errors.subject?.message}
                  />
                )}
              />

              <Controller
                name="buttonText"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="Texto del botón"
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Ej: Ver oferta"
                    error={errors.buttonText?.message}
                  />
                )}
              />

              <Controller
                name="buttonUrl"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="URL del botón"
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="https://ejemplo.com"
                    error={errors.buttonUrl?.message}
                  />
                )}
              />

              <Controller
                name="image"
                control={control}
                render={({ field: { onChange } }) => (
                  <div>
                    <label className="block text-sm/6 font-medium text-gray-900">
                      Archivo adjunto
                    </label>
                    <div className="mt-2">
                      <input
                        type="file"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        className="block w-full text-sm text-gray-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100"
                      />
                    </div>
                    {errors.image && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.image.message as string}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 sm:px-8">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                title="Cancelar"
                onClick={onClose}
                variant="secondary"
                type="button"
              />
              <Button
                title="Enviar"
                onClick={() => {}}
                variant="primary"
                type="submit"
                loading={isSending}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
