/**
 * Project: mxfrragrance
 * Created: 2026/05/14 22:13
 * Author: Scarra Luba
 */
import { useState, useEffect, useCallback } from "react";
import AppContext from "./AppContext";
// import { listenContent, createContent } from "../../helpers/Storefront.js";
import { motion, AnimatePresence } from 'framer-motion';
import { 
    listenToAllOrders, 
    createOrder, 
    updateOrderStatus, 
    updateOrderDetails, 
    deleteOrder,
    addTrackingEvent,
    markOrderPaid
} from "../../helpers/Orders.js";

const INITIAL_STOREFRONT = {
  about: {
    heading1: "Curating the",
    heading2: "Invisible Art.",
    philosophy: "MX Fragrances was born from a singular obsession: the preservation of olfactory history. We do not manufacture; we discover.",
    quote: "Fragrance is a liquid emotion. Once a batch is gone, its specific alchemy is lost to time. Our mission is to find those lost treasures and place them in the hands of true connoisseurs.",
    description: "While most retailers focus on the new, we focus on the exceptional. This includes sealed vintage batches, limited boutique runs, and carefully vetted pieces from the most prestigious private collections in South Africa."
  },
  contact: {
    heading1: "Connect",
    heading2: "with the Vault.",
    description: "For private sourcing requests, authentication queries, or to discuss a piece from your own collection, you may contact me directly through our private channel.",
    instagram: "@mxfragrances",
    tiktok: "@mxfragrances"
  }
};

const ConfirmModal = ({ data, onClose }) => {
  if (!data) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative bg-[#111111] border border-white/10 p-6 w-full max-w-sm rounded-sm shadow-2xl">
        <h3 className="text-xl font-serif text-white mb-2">Confirm Action</h3>
        <p className="text-white/60 text-sm mb-8">{data.message}</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 border border-white/10 text-white/60 py-3 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:text-white transition-colors">Cancel</button>
          <button onClick={() => { data.onConfirm(); onClose(); }} className="flex-1 bg-[#D4AF37] text-black py-3 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-colors">Confirm</button>
        </div>
      </motion.div>
    </div>
  );
};

export function AppProvider({ children }) {
  const [currentPath, setCurrentPath] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [orders, setOrders] = useState([]);

  // Generic Confirm Dialog Wrapper
  const confirm = useCallback((message, onConfirm) => {
    setConfirmDialog({ message, onConfirm });
  }, []);

  // Sync Orders Real-time
  useEffect(() => {
    const unsubscribe = listenToAllOrders((fetchedOrders) => {
        setOrders(fetchedOrders);
    });
    return () => unsubscribe();
  }, []);

  // Exposing Order Helpers via Context
  const handleCreateOrder = async (orderData) => {
      return await createOrder(orderData);
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
      return await updateOrderStatus(orderId, status);
  };

  const handleUpdateOrderDetails = async (orderId, data) => {
      return await updateOrderDetails(orderId, data);
  };

  const handleDeleteOrder = async (orderId) => {
      return await deleteOrder(orderId);
  };

  return (
    <AppContext.Provider 
        value={{
            currentPath, 
            setCurrentPath, 
            confirm,
            orders,
            createOrder: handleCreateOrder,
            updateOrderStatus: handleUpdateOrderStatus,
            updateOrderDetails: handleUpdateOrderDetails,
            deleteOrder: handleDeleteOrder,
            addTrackingEvent,
            markOrderPaid
        }}
    >
      {children}
      <AnimatePresence>
        {confirmDialog && <ConfirmModal data={confirmDialog} onClose={() => setConfirmDialog(null)} />}
      </AnimatePresence>
    </AppContext.Provider>
  );
}