import notification from "@/utils/notification";

interface HandleErrorParams {
    error: any;
    message?: string;
    duration?: number;
}

const handleError = ({error, message = 'Error', duration = 5000}: HandleErrorParams) => {
    const description =
        error?.response?.data?.message ||
        (error?.response?.data?.errors && Object.values(error?.response?.data?.errors)) ||
        error?.messages ||
        error?.message ||
        'An unknown error';
    console.error(error);
    notification.error({
        message: `${message ? message + ': ' : ''} ${description}`,
        duration,
    });
}
export default handleError;
