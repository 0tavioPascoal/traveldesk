import { FormCancelLink } from "@/components/forms/form-cancel-link";

export function ClientFormCancel({ href, dirty }: { href: string; dirty: boolean }) {
  return <FormCancelLink href={href} dirty={dirty} />;
}
