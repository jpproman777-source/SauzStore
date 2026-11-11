import Swal from 'sweetalert2';

const BASE_CLASSES = {
  container: 'sauz-swal-container',
  popup: 'sauz-swal-popup',
  title: 'sauz-swal-title',
  htmlContainer: 'sauz-swal-text',
  actions: 'sauz-swal-actions',
  cancelButton: 'sauz-swal-cancel',
};

/**
 * Muestra un diálogo de confirmación estilizado con la línea visual SAUZ Black.
 * Devuelve true si el usuario confirma la acción.
 */
export async function confirmAction({
  title,
  text,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = false,
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: danger,
    buttonsStyling: false,
    customClass: {
      ...BASE_CLASSES,
      confirmButton: danger ? 'sauz-swal-confirm-danger' : 'sauz-swal-confirm',
    },
  });

  return Boolean(result.isConfirmed);
}

/**
 * Muestra una alerta informativa o de validación sin diálogos nativos del navegador.
 */
export async function notifyAlert({
  title,
  text,
  confirmText = 'Entendido',
  icon,
} = {}) {
  await Swal.fire({
    title,
    text,
    ...(icon ? { icon } : {}),
    confirmButtonText: confirmText,
    buttonsStyling: false,
    customClass: {
      ...BASE_CLASSES,
      confirmButton: 'sauz-swal-confirm',
    },
  });
}
