"use client";

import React from "react";
import { XProvider } from "@ant-design/x";

export const AntdXProvider = ({ children }: { children: React.ReactNode }) => {
  return <XProvider>{children}</XProvider>;
};
