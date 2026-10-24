import { toast as rt } from 'react-hot-toast';

// Export toast object with success, error, info, warning methods
export const toast = {
    success: (message, options) => rt.success(message, options),
    error: (message, options) => rt.error(message, options),
    info: (message, options) => rt.info(message, options),
    warning: (message, options) => rt.warning(message, options),
};

// Default export for convenience (import toast from './toast')
export default toast;