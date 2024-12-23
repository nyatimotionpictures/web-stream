import { VariantProps, cva } from "class-variance-authority";
import React, { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const buttonStyles = cva(["transition-colors"], {
  variants: {
    variant: {
      default: ["bg-primary-500", "hover:bg-primary-400", "text-whites-50"],
      ghost: ["hover:bg-gray-100"],
      disabled: ["bg-secondary-100"],
        },
        size: {
            default: ["rounded", "p-2"],
            icon: [
                "rounded-full",
                "w-10",
                "h-10",
                "flex",
                "items-center",
                "justify-center",
                "p-2.5"
            ]
      }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});

type ButtonProps = VariantProps<typeof buttonStyles> & ComponentProps<"button">
const Button = ({variant, size, className, ...props}: ButtonProps) => {
  return <button {...props} className={twMerge(buttonStyles({variant, size}), className)} />;
};

export default Button;

//"@tanstack/react-query-devtools": "^5.60.2",
// "lucide-react": "^0.460.0",
//"react-phone-input-2": "^2.15.1",
//    "tailwind-merge": "^2.3.0",
//typescript@^4.2.0

