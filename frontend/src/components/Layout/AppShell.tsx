import React from 'react';
import { Layout, LayoutProps } from './Layout';

export type AppShellProps = LayoutProps;

export const AppShell: React.FC<AppShellProps> = (props) => {
  return <Layout {...props} />;
};
