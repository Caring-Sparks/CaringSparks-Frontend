import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Warning } from "phosphor-react";

interface ConfirmationProps {
  setConfirmation: (value: boolean) => void;
  handleDelete: (id: string, name: string) => void;
  id: string;
  deleting: boolean;
  name: string;
}

const Confirmation: React.FC<ConfirmationProps> = ({
  setConfirmation,
  handleDelete,
  deleting,
  id,
  name,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed h-screen w-full flex justify-center items-center top-0 right-0 z-50 bg-black/20 backdrop-blur-md"
        onClick={() => setConfirmation(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col bg-slate-200/10 shadow-lg text-white border rounded-md border-slate-200/10 items-center gap-4 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="bg-red-200 p-4 rounded-full">
            <Warning size={28} className="text-red-600" />
          </span>
          <h1 className="text-center text-sm font-medium">
            Are you sure you want to delete this Administrator?
          </h1>
          <small>This action cannot be reversed.</small>
          <div className="grid md:grid-cols-2 w-full items-center gap-4">
            <button
              onClick={() => handleDelete(id, name)}
              disabled={deleting}
              className="py-2 bg-red-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? "deleting..." : "Yes, delete"}
            </button>
            <button
              onClick={() => setConfirmation(false)}
              className="py-2 bg-gray-200 text-black rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              No, cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Confirmation;
