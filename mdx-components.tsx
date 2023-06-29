import { MDXProvider } from '@mdx-js/react';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

// Define your custom components
const components = {
  h1: ({ children }: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => <h1 style={{ fontSize: "100px" }}>{children}</h1>,
  // Add more custom components as needed
};

// Wrap your MDX content with the MDXProvider component
export function MDXComponents({ children }: { children: React.ReactNode }) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
