import React from "react";

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: React.ReactNode;
};

export default function Link({ href, children, ...props }: LinkProps) {
  return React.createElement("a", { href, ...props }, children);
}
