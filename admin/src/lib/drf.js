import { toast } from "@/services/toast";


/**
 * Universal DRF error handler
 * @param {any} err - Error object from Axios/fetch
 */
export function showDrfErrors(err) {
  try {
    // If it's an Axios error with a response
    if (err.response && err.response.data) {
      const data = err.response.data;

      // Handle DRF validation errors (field errors)
      if (typeof data === "object") {
        Object.keys(data).forEach((key) => {
          const messages = data[key];
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === "string") {
            toast.error(messages);
          }
        });
        return;
      }

      // Fallback: if data is a string
      if (typeof data === "string") {
        toast.error(data);
        return;
      }
    }

    // Handle plain error messages
    if (err.message) {
      toast.error(err.message);
      return;
    }

    // Fallback for unknown error structure
    toast.error("An unknown error occurred.");
  } catch (e) {
    console.error("Error in showErrors:", e);
    toast.error("An error occurred while displaying the error.");
  }
}