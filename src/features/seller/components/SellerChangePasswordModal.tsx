import { ChangePasswordModal, ChangePasswordModalProps } from "@/components/ChangePasswordModal";

export type SellerChangePasswordModalProps = ChangePasswordModalProps;

/** Legacy alias — forwards directly to shared ChangePasswordModal. */
export function SellerChangePasswordModal(props: SellerChangePasswordModalProps) {
  return <ChangePasswordModal {...props} />;
}
