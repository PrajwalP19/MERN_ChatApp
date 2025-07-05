import { create } from "zustand"
import { axiosInstance } from "../lib/axios.js"
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth: async () => {
        set({ isCheckingAuth: true }); // optional reset
        try {
            const res = await axiosInstance.get("/auth/check");
            if (res.data) {
                set({ authUser: res.data });
            } else {
                set({ authUser: null });
            }
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully!");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Signup failed");
            console.log("Error in signup:", error);
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({isLoggingIn: true})
        try {
            const res = await axiosInstance.post("/auth/login", data)
            set({authUser: res.data})
            toast.success("Logged in successfully!!")
        } catch (error) {
            toast.error(error.response.data.message)
            console.log("Error while logging in:", error);
        } finally {
            set({isLoggingIn: false})
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout")
            set({authUser: null})
            toast.success("Logged Out Successfully!!")
        } catch (error) {
            toast.error(error.response.data.message)
            console.log("Error in logging out:", error)
        }
    },

    updateProfile: async (data) => {
        set({isUpdatingProfile: true})
        try {
            const res = await axiosInstance.put("/auth/update", data)
            set({authUser: res.data})
            toast.success("Profile Updated Successfully!!")            
        } catch (error) {
            toast.error(error.response.data.message)
            console.log("Error while updating profile picture:", error);
        } finally {
            set({isUpdatingProfile: false})
        }
    }

}));
