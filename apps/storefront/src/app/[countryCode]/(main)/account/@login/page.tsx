import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Sign in | mphal",
  description: "Sign in to your mphal account to manage orders and saved addresses.",
}

export default function Login() {
  return <LoginTemplate />
}
