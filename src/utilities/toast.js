import { toast } from 'react-toastify';
toast.configure();

export const notifySuccess = () => toast.success("Logged In Successfully", { position: "top-right", autoClose: 3000, theme: 'colored' })
export const notifyError = () => toast.error("Incorrect Username or Password", { position: "top-right", autoClose: 3000, theme: 'colored' })
export const notifySave =() => toast.success("Form Saved Successfully", { position: "top-right", autoClose: 3000, theme: 'colored' })
export const notifyapplied =() => toast.error("Already Applied For Card", { position: "top-center", autoClose: 3000, theme: 'colored' })