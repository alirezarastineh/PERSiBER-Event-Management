import React from "react";
import { motion } from "framer-motion";
import Modal from "../Common/Modal";
import { EditUserRoleModalProps } from "@/types/auth";

export default function EditUserRoleModal({
  isOpen,
  onClose,
  selectedRole,
  setSelectedRole,
  onSave,
  isLoading = false,
}: Readonly<EditUserRoleModalProps>) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User Role">
      <div className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="roleSelect"
            className="block text-sm font-medium text-gray-300"
          >
            Select Role
          </label>
          <select
            id="roleSelect"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-accent-amber focus:border-rich-gold transition-all duration-300"
            disabled={isLoading}
          >
            <option value="" disabled>
              Select role
            </option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex gap-3 pt-3">
          <motion.button
            onClick={onSave}
            disabled={isLoading || !selectedRole}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{
              scale: isLoading || !selectedRole ? 1 : 1.02,
              boxShadow:
                isLoading || !selectedRole ? undefined : "0 5px 15px rgba(212, 175, 55, 0.25)",
            }}
            whileTap={{
              scale: isLoading || !selectedRole ? 1 : 0.98,
            }}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </motion.button>
          <motion.button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white font-medium disabled:opacity-50"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            Cancel
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
