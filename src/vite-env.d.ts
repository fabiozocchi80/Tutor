declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "react-dom/client" {
  import { Root } from "react-dom";
  export function createRoot(container: Element | DocumentFragment): Root;
  export function hydrateRoot(container: Element | DocumentFragment, initialChildren: React.ReactNode): Root;
}
