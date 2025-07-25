import { create } from 'zustand'
import toast from 'react-hot-toast'
import { axiosInstance } from '../lib/axios.js'
import { useAuthStore } from './useAuthStore.js'



export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,         
    isUsersLoading: false,
    isMessagesLoading: false,
    onlineUsers: [],
    
    
    getUsers: async () => {
    set({ isUsersLoading: true });
    try {
        const res = await axiosInstance.get("/message/users");
        set({ users: res.data });
    } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");
        console.log("Error while loading users!!");
    } finally {
        set({ isUsersLoading: false });
    }
    },


    getMessages: async(userId) => {
        set({isMessagesLoading: true})
        try {
            const res = await axiosInstance.get(`/message/${userId}`)
            set({messages: res.data})
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong")
            console.log("Error while getting messages!!");
        } finally {
            set({isMessagesLoading: false})
        }
    },

    sendMessage: async(messageData) => {
        const {selectedUser, messages} = get()

        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser?._id}`, messageData)
            set({messages: [...messages, res.data]})
        } catch (error) {
            toast.error(error.response.data.error)
            console.log("Error while fetching messages:", error)
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get()
        if (!selectedUser) return

        const socket = useAuthStore.getState().socket
        
        socket.on("newMessage", (newMessage) => {
            const isMessageSentFroSelectedUser = newMessage.senderId === selectedUser._id
            if(!isMessageSentFroSelectedUser) return
            set({messages: [...get().messages, newMessage]})
        })
    },

    unsubscribeFromMessages: () => {
          const socket = useAuthStore.getState().socket

          socket.off("newMessage")
    },

    setSelectedUser: (selectedUser) => set({selectedUser})
}))


